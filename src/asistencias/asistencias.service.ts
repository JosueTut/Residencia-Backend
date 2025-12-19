import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CrearPaseListaDto, CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Horario } from 'src/horarios/entities/horario.entity';
import { Asistencia } from './entities/asistencia.entity';
import { Docente } from 'src/docentes/entities/docente.entity';

@Injectable()
export class AsistenciasService {

  constructor(
    // Repositorio de horarios
    @InjectRepository(Horario)
    private readonly horariosRepo: Repository<Horario>,

    // Repositorio de asistencias
    @InjectRepository(Asistencia)
    private readonly asistenciaRepo: Repository<Asistencia>,
  ) {}

  async getReportePorFecha(fecha: string) {
    if (!fecha) throw new BadRequestException('fecha es requerida');

    const asistencias = await this.asistenciaRepo.find({
      where: { fecha },
      relations: {
        horario: { docente: true },
      },
    });

    // Se devuelve información limpia y lista para el frontend
    return asistencias.map(a => ({
      idAsistencia: a.id_asistencia,
      fecha: a.fecha,
      estado: a.estado,
      notaAdicional: a.notaAdicional ?? null,

      idHorario: a.horario?.id_horario,
      profesor: a.horario?.docente?.nombre ?? 'Sin profesor',
      carrera: a.horario?.docente?.carrera ?? '',
      edificio: a.horario?.edificio ?? '',
      salon: a.horario?.aula ?? '',
      horaClase: a.horario?.hora_clase ?? '',
      diaSemana: a.horario?.dia_semana ?? '',
    }));
  }

  // Convierte una fecha YYYY-MM-DD a día de la semana
  // Permite vincular la fecha real con los horarios programados
  private getDiaSemana(fecha: string): string {
    // Puedes devolver 'Lunes', 'Martes', etc. según como guardas en BD
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(fecha + 'T00:00:00'); // evitar problemas de zona horaria
    return dias[d.getDay()];
  }

  async getPaseLista(fecha: string, hora?: string) {

    if (!fecha) throw new BadRequestException('fecha es requerida');

    const diaSemana = this.getDiaSemana(fecha);

    const qb = this.horariosRepo
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.docente', 'p') // ajusta relaciones
      .where('h.Dia_Semana = :dia', { dia: diaSemana });

    if (hora) {
      // Ej: filtrar por un bloque de hora específica
      qb.andWhere('h.Hora_Clase = :hora', { hora });
    }

    const horarios = await qb.getMany();

    // Puedes mapear a un DTO más limpio:
    return horarios.map(h => ({
      idHorario: h.id_horario,
      profesor: h.docente.nombre,
      carrera: h.docente.carrera,
      salon: h.aula,
      edificio: h.edificio,
      diaSemana: h.dia_semana,
      horaClase: h.hora_clase,
    }));
  }

  async guardarPaseLista(dto: CrearPaseListaDto, usuarioId: number | null) {
    const { fecha, registros } = dto;

    if (!fecha) throw new BadRequestException('fecha es requerida');
    if (!registros?.length) throw new BadRequestException('registros es requerido');

    const idsHorarios = registros.map(r => r.idHorario);

    // Verifica que los horarios existan
    const horarios = await this.horariosRepo.find({
      where: { id_horario: In(idsHorarios) },
    });

    if (horarios.length !== idsHorarios.length) {
      throw new BadRequestException('Uno o más horarios no existen');
    }

    // Busca asistencias existentes para evitar duplicados
    const existentes = await this.asistenciaRepo.find({
      where: {
        fecha,
        horario: { id_horario: In(idsHorarios) } as any,
      },
      relations: ['horario'],
    });

    const mapExistentes = new Map<number, Asistencia>();
    for (const a of existentes) {
      mapExistentes.set(a.horario.id_horario, a);
    }

    // Crea nuevas asistencias o actualiza existentes
    const entidades = registros.map(r => {
      const existente = mapExistentes.get(r.idHorario);

      if (existente) {
        existente.estado = r.estado;
        existente.notaAdicional = r.notaAdicional ?? null;
        return existente;
      }

      return this.asistenciaRepo.create({
        fecha,
        id_horario: r.idHorario,
        estado: r.estado,
        notaAdicional: r.notaAdicional ?? null,
      });
    });

    await this.asistenciaRepo.save(entidades);

    return {
      message: 'Pase de lista guardado correctamente',
      total: entidades.length,
    };
  }


  // Devuelve las asistencias tomadas en esa fecha (para verlas y corregirlas).
  async getAsistenciasPorFecha(fecha: string) {
    if (!fecha) throw new BadRequestException('La fecha es requerida');

    const asistencias = await this.asistenciaRepo.find({
      where: { fecha },
      // por si en algún momento se quita el eager, esto lo mantiene estable:
      relations: {
        horario: { docente: true },
      },
      order: {
        // orden directo por campos del entity Asistencia (no de horario)
        // así que ordenaremos manualmente abajo
        id_asistencia: 'ASC',
      },
    });

    // Orden manual: edificio -> aula -> hora_clase
    const getTexto = (v?: string | null) => String(v ?? '').toUpperCase();
    const getHoraInicio = (hora?: string | null) => {
      const txt = String(hora ?? '');
      const m = txt.match(/(\d{1,2})(?::(\d{2}))?/);
      if (!m) return Number.MAX_SAFE_INTEGER;
      const hh = Number(m[1]);
      const mm = m[2] ? Number(m[2]) : 0;
      return hh * 60 + mm;
    };

    const sorted = [...asistencias].sort((a, b) => {
      const ha = a.horario;
      const hb = b.horario;

      const cmpEd = getTexto(ha?.edificio).localeCompare(getTexto(hb?.edificio));
      if (cmpEd !== 0) return cmpEd;

      const cmpAula = getTexto(ha?.aula).localeCompare(getTexto(hb?.aula));
      if (cmpAula !== 0) return cmpAula;

      return getHoraInicio(ha?.hora_clase) - getHoraInicio(hb?.hora_clase);
    });

    // Mapeo al formato que tu front necesita
    return sorted.map(a => ({
      idAsistencia: a.id_asistencia,
      idHorario: a.id_horario,
      profesor: a.horario?.docente?.nombre ?? 'Sin profesor',
      carrera: a.horario?.docente?.carrera ?? '',
      edificio: a.horario?.edificio ?? '',
      salon: a.horario?.aula ?? '',
      horaClase: a.horario?.hora_clase ?? '',
      estado: a.estado,
      nota: a.notaAdicional ?? '',
    }));
  }

  // Actualiza estado y/o notaAdicional.
  async update(id: number, dto: UpdateAsistenciaDto) {
    const asistencia = await this.asistenciaRepo.findOne({
      where: { id_asistencia: id },
    });

    if (!asistencia) throw new NotFoundException('Asistencia no encontrada');

    if (dto.estado !== undefined) asistencia.estado = dto.estado;
    if (dto.notaAdicional !== undefined)
      asistencia.notaAdicional = dto.notaAdicional?.trim() || null;

    await this.asistenciaRepo.save(asistencia);

    return {
      message: 'Asistencia actualizada correctamente',
      idAsistencia: asistencia.id_asistencia,
    };
  }

  
  create(createAsistenciaDto: CreateAsistenciaDto) {
    return 'This action adds a new asistencia';
  }

  findAll() {
    return `This action returns all asistencias`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asistencia`;
  }

  remove(id: number) {
    return `This action removes a #${id} asistencia`;
  }
}


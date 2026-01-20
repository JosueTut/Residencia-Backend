import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CrearPaseListaDto, CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { In, Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Horario } from 'src/horarios/entities/horario.entity';
import { Asistencia } from './entities/asistencia.entity';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Horario)
    private readonly horariosRepo: Repository<Horario>,

    @InjectRepository(Asistencia)
    private readonly asistenciaRepo: Repository<Asistencia>,
  ) {}

  /* ===================== REPORTES ===================== */

  async getReportePorFecha(fecha: string) {
    if (!fecha) throw new BadRequestException('fecha es requerida');

    const asistencias = await this.asistenciaRepo.find({
      where: { fecha },
      relations: { horario: { docente: true } },
    });

    return asistencias.map(a => ({
      idAsistencia: a.id_asistencia,
      fecha: a.fecha,
      horaRegistro: a.horaRegistro,
      estado: a.estado,
      notaAdicional: a.notaAdicional ?? null,

      profesor:
        a.docenteNombreSnapshot ??
        a.horario?.docente?.nombre ??
        'Sin profesor',

      carrera:
        a.docenteCarreraSnapshot ??
        a.horario?.docente?.carrera ??
        '',

      tipo:
        a.docenteTipoSnapshot ??
        a.horario?.docente?.tipo ??
        'HORAS',

      edificio: a.edificioSnapshot ?? a.horario?.edificio ?? '',
      salon: a.aulaSnapshot ?? a.horario?.aula ?? '',
      horaClase: a.horaClaseSnapshot ?? a.horario?.hora_clase ?? '',
      diaSemana: a.diaSemanaSnapshot ?? a.horario?.dia_semana ?? '',
    }));
  }

  async getPorRango(fechaInicio: string, fechaFin: string) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin < inicio) {
      [fechaInicio, fechaFin] = [fechaFin, fechaInicio];
    }

    const asistencias = await this.asistenciaRepo.find({
      where: { fecha: Between(fechaInicio, fechaFin) },
      relations: { horario: { docente: true } },
      order: { fecha: 'ASC' },
    });

    return asistencias.map(a => ({
      idAsistencia: a.id_asistencia,
      fecha: a.fecha,
      horaRegistro: a.horaRegistro,
      estado: a.estado,
      notaAdicional: a.notaAdicional ?? null,

      profesor:
        a.docenteNombreSnapshot ??
        a.horario?.docente?.nombre ??
        '',

      carrera:
        a.docenteCarreraSnapshot ??
        a.horario?.docente?.carrera ??
        '',

      tipo:
        a.docenteTipoSnapshot ??
        a.horario?.docente?.tipo ??
        'HORAS',

      edificio: a.edificioSnapshot ?? a.horario?.edificio ?? '',
      salon: a.aulaSnapshot ?? a.horario?.aula ?? '',
      horaClase: a.horaClaseSnapshot ?? a.horario?.hora_clase ?? '',
    }));
  }

  /* ===================== PASE DE LISTA ===================== */

  private getDiaSemana(fecha: string): string {
    const dias = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const d = new Date(fecha + 'T00:00:00');
    return dias[d.getDay()];
  }

  async getPaseLista(fecha: string, hora?: string) {
    if (!fecha) throw new BadRequestException('fecha es requerida');

    const diaSemana = this.getDiaSemana(fecha);

    const qb = this.horariosRepo
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.docente', 'p')
      .where('h.dia_semana = :dia', { dia: diaSemana })
      .andWhere('p.activo = :activo', { activo: true });

    if (hora) qb.andWhere('h.hora_clase = :hora', { hora });

    const horarios = await qb.getMany();

    // ✅ Buscar asistencias ya registradas para esta fecha y esos horarios
    const idsHorarios = horarios.map(h => h.id_horario);

    const asistencias = idsHorarios.length
      ? await this.asistenciaRepo.find({
          where: {
            fecha,
            id_horario: In(idsHorarios),
          },
        })
      : [];

    const mapAsistencia = new Map<number, Asistencia>();
    asistencias.forEach(a => {
      if (a.id_horario != null) mapAsistencia.set(a.id_horario, a);
    });

    return await Promise.all(
      horarios.map(async h => {
        const a = mapAsistencia.get(h.id_horario);

        // ✅ Si ya hay asistencia para ESTE id_horario, no bloqueamos (es el mismo registro)
        if (a) {
          return {
            idHorario: h.id_horario,
            profesor: h.docente?.nombre ?? 'Sin profesor',
            carrera: h.docente?.carrera ?? '',
            salon: h.aula,
            edificio: h.edificio,
            diaSemana: h.dia_semana,
            horaClase: h.hora_clase,

            estado: a.estado ?? null,
            notaAdicional: a.notaAdicional ?? null,
            horaRegistro: a.horaRegistro ?? null,

            // ✅ nuevos para UX
            bloqueado: false,
            motivoBloqueo: null,
            idAsistenciaExistente: a.id_asistencia ?? null,
          };
        }

        // ✅ NUEVO: si ya existe una asistencia ese día para el mismo docente y hora,
        // aunque sea de otro horario (por ejemplo borrado y recreado), entonces BLOQUEAR.
        const docenteId = h.id_docente;
        const docenteNombre = h.docente?.nombre ?? '';

        const duplicado = await this.existeAsistenciaDuplicadaPorDocenteHora({
          fecha,
          docenteId,
          horaClase: h.hora_clase,
          ignorarIdHorario: h.id_horario, // ignora este horario (para no false-positive)
        });

        if (duplicado) {
          return {
            idHorario: h.id_horario,
            profesor: h.docente?.nombre ?? 'Sin profesor',
            carrera: h.docente?.carrera ?? '',
            salon: h.aula,
            edificio: h.edificio,
            diaSemana: h.dia_semana,
            horaClase: h.hora_clase,

            // ✅ sin datos porque NO se debe capturar aquí (ya existe otro pase de lista)
            estado: null,
            notaAdicional: null,
            horaRegistro: null,

            // ✅ nuevos para UX
            bloqueado: true,
            motivoBloqueo:
              `Ya existe pase de lista para ${docenteNombre || 'este docente'} el ${fecha} a las ${h.hora_clase}. ` +
              `Si necesitas cambiarlo, usa "Modificación de asistencia".`,
            idAsistenciaExistente: null, // (opcional) si quieres devolverlo, lo buscamos con otro query
          };
        }

        // ✅ Normal: se puede pasar lista
        return {
          idHorario: h.id_horario,
          profesor: h.docente?.nombre ?? 'Sin profesor',
          carrera: h.docente?.carrera ?? '',
          salon: h.aula,
          edificio: h.edificio,
          diaSemana: h.dia_semana,
          horaClase: h.hora_clase,

          estado: null,
          notaAdicional: null,
          horaRegistro: null,

          bloqueado: false,
          motivoBloqueo: null,
          idAsistenciaExistente: null,
        };
      }),
    );
  }

   /* En una fecha dada, un docente no puede tener 2 asistencias para la misma hora de clase,
      aunque el horario se haya borrado y se cree uno nuevo. */
  private async existeAsistenciaDuplicadaPorDocenteHora(params: {
    fecha: string;
    docenteId: number;
    horaClase: string;
    ignorarIdHorario?: number; // si quieres permitir actualizar la misma asistencia ligada a este horario
  }): Promise<boolean> {
    const { fecha, docenteId, horaClase, ignorarIdHorario } = params;

    const qb = this.asistenciaRepo
      .createQueryBuilder('a')
      .leftJoin('a.horario', 'h')
      .leftJoin('h.docente', 'p')
      .where('a.fecha = :fecha', { fecha })
      .andWhere(
        `(
          (a.horaClaseSnapshot = :hora)
          OR (h.hora_clase = :hora)
        )`,
        { hora: horaClase },
      )
      .andWhere(
        `(
          (h.id_docente = :docenteId)
          OR (a.id_horario IS NULL AND a.docenteIdSnapshot = :docenteId)
        )`,
        { docenteId },
      );

    // si quieres ignorar el mismo horario (cuando estás guardando sobre el mismo horario)
    if (typeof ignorarIdHorario === 'number') {
      qb.andWhere('(a.id_horario IS NULL OR a.id_horario <> :ignorar)', { ignorar: ignorarIdHorario });
    }

    const found = await qb.getOne();
    return Boolean(found);
  }

  async guardarPaseLista(dto: CrearPaseListaDto, usuarioId: number | null) {
    const { fecha, registros } = dto;

    if (!fecha) throw new BadRequestException('fecha es requerida');
    if (!registros?.length)
      throw new BadRequestException('registros es requerido');

    const idsHorarios = registros.map(r => r.idHorario);

    const horarios = await this.horariosRepo.find({
      where: { id_horario: In(idsHorarios) },
      relations: { docente: true },
    });

    if (horarios.length !== idsHorarios.length) {
      throw new BadRequestException('Uno o más horarios no existen');
    }

    const mapHorarios = new Map<number, Horario>();
    horarios.forEach(h => mapHorarios.set(h.id_horario, h));

    // ✅ Traer asistencias ya registradas para esa fecha y esos horarios (por id_horario directo)
    const existentes = await this.asistenciaRepo.find({
      where: {
        fecha,
        id_horario: In(idsHorarios),
      },
    });

    // ✅ Mapear por id_horario (ya no dependemos de la relación "horario")
    const mapExistentes = new Map<number, Asistencia>();
    existentes.forEach(a => {
      if (a.id_horario != null) mapExistentes.set(a.id_horario, a);
    });

    const horaActual = new Date().toTimeString().slice(0, 8);

    const entidades = await Promise.all(
      registros.map(async r => {
        const existente = mapExistentes.get(r.idHorario);
        const h = mapHorarios.get(r.idHorario);

        if (!h) {
          throw new BadRequestException('Horario no encontrado para un registro');
        }

        // ✅ Si ya existe por (fecha + id_horario), se actualiza (comportamiento actual)
        if (existente) {
          existente.estado = r.estado;
          existente.notaAdicional = r.notaAdicional ?? null;
          existente.horaRegistro = horaActual;
          return existente;
        }

        // ✅ NUEVO: bloquear duplicados por (fecha + docente + horaClase)
        const docenteId = h.id_docente;
        const docenteNombre = h.docente?.nombre ?? '';

        const duplicado = await this.existeAsistenciaDuplicadaPorDocenteHora({
          fecha,
          docenteId,
          horaClase: h.hora_clase,
          ignorarIdHorario: r.idHorario,
        });

        if (duplicado) {
          // 409 Conflict
          throw new ConflictException(
            `Ya existe un pase de lista para ${docenteNombre || 'este docente'} en ${fecha} a las ${h.hora_clase}. ` +
              `Si necesitas cambiarlo, usa el apartado de Modificación de asistencia.`,
          );
        }

        // ✅ Si no hay duplicado, crear normal
        return this.asistenciaRepo.create({
          fecha,
          id_horario: r.idHorario,
          estado: r.estado,
          notaAdicional: r.notaAdicional ?? null,

          // ✅ snapshots docente
          docenteIdSnapshot: h?.id_docente ?? null,
          docenteNombreSnapshot: h?.docente?.nombre ?? null,
          docenteCarreraSnapshot: h?.docente?.carrera ?? null,
          docenteTipoSnapshot: h?.docente?.tipo ?? null,

          // ✅ snapshots horario
          edificioSnapshot: h?.edificio ?? null,
          aulaSnapshot: h?.aula ?? null,
          horaClaseSnapshot: h?.hora_clase ?? null,
          diaSemanaSnapshot: h?.dia_semana ?? null,

          horaRegistro: horaActual,
        });
      }),
    );


    await this.asistenciaRepo.save(entidades);

    return {
      message: 'Pase de lista guardado correctamente',
      total: entidades.length,
    };
  }

  /* ===================== MODIFICACIÓN ===================== */

  async getAsistenciasPorFecha(fecha: string) {
    if (!fecha) throw new BadRequestException('La fecha es requerida');

    const asistencias = await this.asistenciaRepo.find({
      where: { fecha },
      relations: { horario: { docente: true } },
      order: { id_asistencia: 'ASC' },
    });

    return asistencias.map(a => ({
      idAsistencia: a.id_asistencia,
      idHorario: a.id_horario,
      fecha: a.fecha,
      horaRegistro: a.horaRegistro,
      profesor:
        a.docenteNombreSnapshot ??
        a.horario?.docente?.nombre ??
        'Sin profesor',
      carrera:
        a.docenteCarreraSnapshot ??
        a.horario?.docente?.carrera ??
        '',
      edificio: a.edificioSnapshot ?? a.horario?.edificio ?? '',
      salon: a.aulaSnapshot ?? a.horario?.aula ?? '',
      horaClase: a.horaClaseSnapshot ?? a.horario?.hora_clase ?? '',
      estado: a.estado,
      nota: a.notaAdicional ?? '',
    }));
  }

  async update(id: number, dto: UpdateAsistenciaDto) {
    const asistencia = await this.asistenciaRepo.findOne({
      where: { id_asistencia: id },
    });

    if (!asistencia)
      throw new NotFoundException('Asistencia no encontrada');

    if (dto.estado !== undefined) asistencia.estado = dto.estado;
    if (dto.notaAdicional !== undefined)
      asistencia.notaAdicional = dto.notaAdicional?.trim() || null;

    await this.asistenciaRepo.save(asistencia);

    return {
      message: 'Asistencia actualizada correctamente',
      idAsistencia: asistencia.id_asistencia,
    };
  }

  /* ===================== STUBS ===================== */

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

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Horario } from './entities/horario.entity';
import { Repository } from 'typeorm';
import { Docente } from 'src/docentes/entities/docente.entity';

@Injectable()
export class HorariosService {

  constructor(
    // Repositorio de horarios
    @InjectRepository(Horario)
    private readonly horariosRepository: Repository<Horario>,

    // Repositorio de docentes (para validaciones)
    @InjectRepository(Docente)
    private readonly docentesRepository: Repository<Docente>,
  ) {}

  // Crear un nuevo horario
  async create(createHorarioDto: CreateHorarioDto): Promise<Horario> {

    // Verifica que el docente exista
    const docente = await this.docentesRepository.findOne({
      where: { id_docente: createHorarioDto.id_docente }
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Verifica que no exista un horario duplicado para el mismo docente
    const horarioExistente = await this.horariosRepository.findOne({
      where: {
        id_docente: docente.id_docente,
        dia_semana: createHorarioDto.dia_semana,
        hora_clase: createHorarioDto.hora_clase,
      },
    });

    if (horarioExistente) {
      throw new BadRequestException(
        'El docente ya tiene un horario asignado en ese día y hora',
      );
    }

    // Crea el horario
    const horario = this.horariosRepository.create({
      dia_semana: createHorarioDto.dia_semana,
      hora_clase: createHorarioDto.hora_clase,
      aula: createHorarioDto.aula ?? null,
      edificio: createHorarioDto.edificio ?? null,
      id_docente: docente.id_docente,
      docente: docente,
    });

    // Guarda el horario en la base de datos
    return await this.horariosRepository.save(horario);
  }

  // Obtener todos los horarios con su docente
  async findAll() {
    return await this.horariosRepository.find({
      relations: ['docente'],
    });
  }

  // Obtener un horario específico
  async findOne(id: number) {
    const horario = await this.horariosRepository.findOne({
      where: { id_horario: id },
      relations: ['docente'],
    });

    if (!horario) {
      throw new NotFoundException('Horario no encontrado');
    }

    return horario;
  }

  // Actualizar un horario
  async update(id: number, updateHorarioDto: UpdateHorarioDto) {
    const resultado = await this.horariosRepository.update(id, updateHorarioDto);

    if (resultado.affected === 0) {
      throw new NotFoundException('Horario no encontrado');
    }

    return this.findOne(id);
  }

  // Eliminar un horario
  async remove(id: number) {
    const resultado = await this.horariosRepository.delete({ id_horario: id });

    if (!resultado.affected) {
      throw new NotFoundException('Horario no encontrado');
    }

    return { mensaje: 'Horario eliminado correctamente' };
  }
}

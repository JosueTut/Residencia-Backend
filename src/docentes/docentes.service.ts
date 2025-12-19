import { Injectable } from '@nestjs/common';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { Repository } from 'typeorm';
import { Docente } from './entities/docente.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DocentesService {

  constructor(
    // Inyección del repositorio de la entidad Docente
    @InjectRepository(Docente)
    private readonly docentesService: Repository<Docente>,
  ) {}

  // Crear un nuevo docente
  async create(createDocenteDto: CreateDocenteDto) {
    const docente = this.docentesService.create(createDocenteDto);
    return await this.docentesService.save(docente);
  }

  // Obtener todos los docentes registrados
  async findAll() {
    return await this.docentesService.find();
  }

  // Obtener un docente específico por ID
  async findOne(id: number) {
    return await this.docentesService.findOneBy({ id_docente: id });
  }

  // Actualizar información de un docente
  async update(id: number, updateDocenteDto: UpdateDocenteDto) {
    return await this.docentesService.update(id, updateDocenteDto);
  }

  // Eliminar un docente del sistema
  async remove(id: number) {
    return await this.docentesService.delete(id);
  }
}

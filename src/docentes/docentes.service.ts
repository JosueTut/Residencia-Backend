import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { Repository } from 'typeorm';
import { Docente, TipoDocente } from './entities/docente.entity';
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
    const nombre = createDocenteDto.nombre?.trim();
    const carrera = createDocenteDto.carrera?.trim();

    if (!nombre || !carrera) throw new BadRequestException('nombre y carrera son requeridos');

    const docente = this.docentesService.create({
      nombre,
      carrera,
      activo: createDocenteDto.activo ?? true, 
      tipo: createDocenteDto.tipo,
    });

    return this.docentesService.save(docente);
  }

  // Obtener todos los docentes registrados
  async findAll() {
    // ordenado por carrera y nombre
    return this.docentesService.find({
      order: { carrera: 'ASC', nombre: 'ASC' },
    });
  }

  // Obtener un docente específico por ID
  async findOne(id: number) {
    return await this.docentesService.findOneBy({ id_docente: id });
  }

  // Actualizar información de un docente
  async updateDocente(id: number, dto: UpdateDocenteDto) {
    const docente = await this.docentesService.findOne({ where: { id_docente: id } });
    if (!docente) throw new NotFoundException('Docente no encontrado');

    // Validaciones simples extra
    if (dto.nombre !== undefined && !dto.nombre.trim()) {
      throw new BadRequestException('nombre no puede ir vacío');
    }
    if (dto.carrera !== undefined && !dto.carrera.trim()) {
      throw new BadRequestException('carrera no puede ir vacío');
    }

    if (dto.nombre !== undefined) docente.nombre = dto.nombre.trim();
    if (dto.carrera !== undefined) docente.carrera = dto.carrera.trim();
    if (dto.activo !== undefined) docente.activo = dto.activo;
    if (dto.tipo !== undefined) docente.tipo = dto.tipo;

    return await this.docentesService.save(docente);
  }

  async updateTipo(id: number, tipo: TipoDocente) {
    if (!tipo) throw new BadRequestException('tipo es requerido');

    const docente = await this.docentesService.findOne({
      where: { id_docente: id },
    });

    if (!docente) throw new NotFoundException('Docente no encontrado');

    docente.tipo = tipo;
    await this.docentesService.save(docente);

    return docente;
  }

  // Eliminar un docente del sistema
  async remove(id: number) {
    // Si ya no quieres eliminar nunca, puedes deshabilitar esto en el controller.
    const docente = await this.docentesService.findOne({ where: { id_docente: id } });
    if (!docente) throw new NotFoundException('Docente no encontrado');
    await this.docentesService.remove(docente);
    return { message: 'Docente eliminado' };
  }
}

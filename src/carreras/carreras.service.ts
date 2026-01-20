import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrera } from './entities/carrera.entity';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';

const norm = (v: any) => String(v ?? '').trim();

@Injectable()
export class CarrerasService {
  constructor(
    @InjectRepository(Carrera)
    private readonly repo: Repository<Carrera>,
  ) {}

  async findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { idCarrera: id } });
    if (!row) throw new NotFoundException('Carrera no encontrada');
    return row;
  }

  async create(dto: CreateCarreraDto) {
    const nombre = norm(dto.nombre);
    if (!nombre) throw new ConflictException('El nombre es requerido');

    const exists = await this.repo.findOne({ where: { nombre } });
    if (exists) throw new ConflictException('Ya existe una carrera con ese nombre');

    const created = this.repo.create({ nombre });
    return this.repo.save(created);
  }

  async update(id: number, dto: UpdateCarreraDto) {
    const nombre = norm(dto.nombre);

    const row = await this.findOne(id);

    const other = await this.repo.findOne({ where: { nombre } });
    if (other && other.idCarrera !== row.idCarrera) {
      throw new ConflictException('Ya existe una carrera con ese nombre');
    }

    row.nombre = nombre;
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);

    // ✅ Si quieres BLOQUEAR el delete si hay docentes usando esa carrera:
    // (solo aplica si tus docentes guardan carrera como TEXTO)
    //
    // OJO: esto requiere tu repo/tabla de docentes. Si no quieres esto ahora, bórralo.
    //
    // Ejemplo (si tienes tabla docentes con columna "carrera" texto):
    // const count = await this.docentesRepo.count({ where: { carrera: row.nombre } });
    // if (count > 0) throw new ConflictException(`No se puede eliminar: hay ${count} docente(s) usando esta carrera.`);

    await this.repo.remove(row);
    return { message: 'Carrera eliminada correctamente' };
  }
}

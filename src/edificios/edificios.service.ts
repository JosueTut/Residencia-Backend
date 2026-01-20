import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Edificio } from './entities/edificio.entity';
import { Salon } from './entities/salon.entity';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';

@Injectable()
export class EdificiosService {
  constructor(
    @InjectRepository(Edificio) private readonly edificiosRepo: Repository<Edificio>,
    @InjectRepository(Salon) private readonly salonesRepo: Repository<Salon>,
  ) {}

  async findAll() {
    return this.edificiosRepo.find({
      order: { nombre: 'ASC' },
      relations: { salones: true },
    });
  }

  async findOne(id: number) {
    const e = await this.edificiosRepo.findOne({
      where: { id },
      relations: { salones: true },
    });
    if (!e) throw new NotFoundException('Edificio no encontrado');
    // ordenar salones por nombre
    e.salones = (e.salones ?? []).sort((a, b) => a.nombre.localeCompare(b.nombre));
    return e;
  }

  async create(dto: CreateEdificioDto) {
    const nombre = dto.nombre.trim();

    const exists = await this.edificiosRepo.findOne({ where: { nombre } });
    if (exists) throw new BadRequestException('Ya existe un edificio con ese nombre');

    const edificio = this.edificiosRepo.create({
      nombre,
      salones: (dto.salones ?? [])
        .map(s => ({ nombre: s.nombre.trim() }))
        .filter(s => s.nombre.length > 0) as any,
    });

    try {
      return await this.edificiosRepo.save(edificio);
    } catch (e: any) {
      throw new BadRequestException(e?.message ?? 'Error al crear edificio');
    }
  }

  async update(id: number, dto: UpdateEdificioDto) {
    const edificio = await this.edificiosRepo.findOne({ where: { id } });
    if (!edificio) throw new NotFoundException('Edificio no encontrado');

    if (dto.nombre) {
      const nombre = dto.nombre.trim();
      const exists = await this.edificiosRepo.findOne({ where: { nombre } });
      if (exists && exists.id !== id) {
        throw new BadRequestException('Ya existe un edificio con ese nombre');
      }
      edificio.nombre = nombre;
    }

    return this.edificiosRepo.save(edificio);
  }

  async remove(id: number) {
    const edificio = await this.edificiosRepo.findOne({ where: { id } });
    if (!edificio) throw new NotFoundException('Edificio no encontrado');
    await this.edificiosRepo.remove(edificio);
    return { ok: true };
  }

  // ===== Salones =====
  async addSalon(edificioId: number, dto: CreateSalonDto) {
    const edificio = await this.edificiosRepo.findOne({ where: { id: edificioId } });
    if (!edificio) throw new NotFoundException('Edificio no encontrado');

    const salon = this.salonesRepo.create({
      nombre: dto.nombre.trim(),
      edificioId,
    });

    try {
      return await this.salonesRepo.save(salon);
    } catch (e: any) {
      // puede fallar por unique (edificioId+nombre)
      throw new BadRequestException('Ese salón ya existe en este edificio');
    }
  }

  async updateSalon(salonId: number, dto: UpdateSalonDto) {
    const salon = await this.salonesRepo.findOne({ where: { id: salonId } });
    if (!salon) throw new NotFoundException('Salón no encontrado');

    if (dto.nombre) salon.nombre = dto.nombre.trim();

    try {
      return await this.salonesRepo.save(salon);
    } catch {
      throw new BadRequestException('Ese salón ya existe en este edificio');
    }
  }

  async removeSalon(salonId: number) {
    const salon = await this.salonesRepo.findOne({ where: { id: salonId } });
    if (!salon) throw new NotFoundException('Salón no encontrado');
    await this.salonesRepo.remove(salon);
    return { ok: true };
  }
}

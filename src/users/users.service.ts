import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // Crear un nuevo usuario
  async create(dto: CreateUserDto) {

    // Validar rol contra enum
    const rolNormalizado = String(dto.rol ?? '')
      .toUpperCase()
      .trim()
      .replace(/\s+/g, '_');

    const rolesValidos = Object.values(require('../auth/roles.enum').Role) as string[];
    if (!rolesValidos.includes(rolNormalizado)) {
      throw new BadRequestException('Rol inválido');
    }

    const email = dto.email.toLowerCase().trim();

    const exists = await this.usersRepo.findOne({
      where: { email },
      withDeleted: false,
    });

    if (exists) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      name: dto.name.trim(),
      email,
      password: hashedPassword,
      rol: rolNormalizado,
    });

    const saved = await this.usersRepo.save(user);

    // nunca regreses password
    return { id: saved.id, name: saved.name, email: saved.email, rol: saved.rol };
  }

  // Obtener todos los usuarios (sin contraseña)
  async findAll() {
    return await this.usersRepo.find({
      select: ['id', 'name', 'email', 'rol'],
      order: { id: 'DESC' },
    });
  }

  // Buscar usuario por correo (usado en Auth)
  async findOneByEmail(email: string) {
    return await this.usersRepo.findOneBy({ email });
  }

  // Buscar usuario por ID (público, sin password)
  async findOne(id: number) {
    const user = await this.usersRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'rol'],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Actualizar info básica (name/email/rol) y regresar el usuario actualizado
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Normaliza email si viene
    if (dto.email !== undefined) {
      const newEmail = dto.email.toLowerCase().trim();

      // si cambió, valida duplicado
      if (newEmail !== user.email) {
        const exists = await this.usersRepo.findOne({ where: { email: newEmail } });
        if (exists) throw new BadRequestException('Email already exists');
      }

      user.email = newEmail;
    }

    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.rol !== undefined) user.rol = dto.rol;

    const saved = await this.usersRepo.save(user);

    // Regresa sin password (esto lo necesita tu frontend)
    return { id: saved.id, name: saved.name, email: saved.email, rol: saved.rol };
  }

  // Actualizar únicamente el rol del usuario
  async updateRole(id: number, rol: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.rol = rol;
    const saved = await this.usersRepo.save(user);

    return { id: saved.id, name: saved.name, email: saved.email, rol: saved.rol };
  }

  // Eliminar usuario del sistema
  async remove(id: number) {
    return await this.usersRepo.delete(id);
  }
}

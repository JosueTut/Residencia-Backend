import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import bcryptjs from 'node_modules/bcryptjs';

@Injectable()
export class UsersService {

  constructor(
    // Inyección del repositorio de la entidad User
    @InjectRepository(User)
    private readonly usersService: Repository<User>,
  ) {}

  // Crear un nuevo usuario
  async create(dto: CreateUserDto) {
    // Verifica si el correo ya existe
    const exists = await this.usersService.findOne({
      where: { email: dto.email.toLowerCase().trim() },
      withDeleted: false,
    });

    if (exists) throw new BadRequestException('Email already exists');
    // Encripta la contraseña antes de guardarla
    const hashedPassword = await bcryptjs.hash(dto.password, 10);

    // Crea la entidad usuario
    const user = this.usersService.create({
      name: dto.name,
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      rol: dto.rol,
    });
    // Guarda el usuario en la base de datos
    return this.usersService.save(user);
  }

  // Obtener todos los usuarios (sin contraseña)
  async findAll() {
    return await this.usersService.find({
      select: ['id', 'name', 'email', 'rol'],
    });
  }

  // Buscar usuario por correo (usado en Auth)
  async findOneByEmail(email: string) {
    return await this.usersService.findOneBy({ email });
  }

  // Buscar usuario por ID
  async findOne(id: number) {
    return await this.usersService.findOneBy({ id });
  }

  // Actualizar información básica del usuario
  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  // Actualizar únicamente el rol del usuario
  async updateRole(id: number, rol: string) {
    const user = await this.usersService.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.rol = rol;
    return this.usersService.save(user);
  }

  // Eliminar usuario del sistema
  async remove(id: number) {
    return await this.usersService.delete(id);
  }
}

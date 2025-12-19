import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard) // Protege todas las rutas
@Roles(Role.RRHH, Role.DIRECTOR, Role.ROOT) // Roles permitidos
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // Crear usuario
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Obtener lista de usuarios
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Obtener usuario por ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  // Actualizar datos del usuario
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // Actualizar rol del usuario
  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body('rol') rol: string,
  ) {
    return this.usersService.updateRole(+id, rol);
  }

  // Eliminar usuario
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}

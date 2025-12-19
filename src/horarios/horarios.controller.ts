import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard, RolesGuard) // Protección por autenticación y roles
@Roles(Role.RRHH, Role.DIRECTOR, Role.ROOT)
@Controller('horarios')
export class HorariosController {
  constructor(
    private readonly horariosService: HorariosService
  ) {}

  // Crear horario
  @Post()
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horariosService.create(createHorarioDto);
  }

  // Obtener todos los horarios
  @Get()
  findAll() {
    return this.horariosService.findAll();
  }

  // Obtener horario por ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.horariosService.findOne(id);
  }

  // Actualizar horario
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateHorarioDto: UpdateHorarioDto) {
    return this.horariosService.update(id, updateHorarioDto);
  }

  // Eliminar horario
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.horariosService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { TipoDocente } from './entities/docente.entity';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.RRHH, Role.DIRECTOR, Role.JEFE_CARRERA, Role.ROOT) 
@Controller('docentes') // /api/v1/docentes
export class DocentesController {
  constructor(private readonly docentesService: DocentesService) {}

  // Registrar un nuevo docente
  @Post()
  create(@Body() createDocenteDto: CreateDocenteDto) {
    return this.docentesService.create(createDocenteDto);
  }

  // Obtener lista de todos los docentes
  @Get()
  findAll() {
    return this.docentesService.findAll();
  }

  // Obtener docente por ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.docentesService.findOne(id);
  }

  // activar / desactivar un docente
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocenteDto) {
    return this.docentesService.updateDocente(Number(id), dto);
  }

  @Patch(':id/tipo')
  updateTipo(@Param('id') id: string, @Body('tipo') tipo: TipoDocente) {
    return this.docentesService.updateTipo(+id, tipo);
  }

  // Eliminar un docente
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.docentesService.remove(id);
  }
}

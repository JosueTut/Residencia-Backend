import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';

@Controller('docentes') // /api/v1/docentes
export class DocentesController {

  constructor(
    private readonly docentesService: DocentesService,
  ) {}

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

  // Actualizar datos de un docente
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDocenteDto: UpdateDocenteDto) {
    return this.docentesService.update(id, updateDocenteDto);
  }

  // Eliminar un docente
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.docentesService.remove(id);
  }
}

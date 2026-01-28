import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EdificiosService } from './edificios.service';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.RRHH, Role.DIRECTOR, Role.JEFE_CARRERA, Role.ROOT)
@Controller('edificios')
export class EdificiosController {
  constructor(private readonly service: EdificiosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateEdificioDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEdificioDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  // Salones
  @Post(':id/salones')
  addSalon(@Param('id') id: string, @Body() dto: CreateSalonDto) {
    return this.service.addSalon(Number(id), dto);
  }

  @Patch('salones/:salonId')
  updateSalon(@Param('salonId') salonId: string, @Body() dto: UpdateSalonDto) {
    return this.service.updateSalon(Number(salonId), dto);
  }

  @Delete('salones/:salonId')
  removeSalon(@Param('salonId') salonId: string) {
    return this.service.removeSalon(Number(salonId));
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { CrearPaseListaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '../auth/roles.enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RangoAsistenciasDto } from './dto/rango-asistencias.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  // =========================
  // Pase de lista
  // =========================

  @Get('pase-lista')
  @Roles(Role.PREFECTO, Role.DIRECTOR, Role.RRHH, Role.ROOT)
  getPaseLista(@Query('fecha') fecha: string, @Query('hora') hora?: string) {
    return this.asistenciasService.getPaseLista(fecha, hora);
  }

  @Post('pase-lista')
  @Roles(Role.PREFECTO, Role.DIRECTOR, Role.RRHH, Role.ROOT)
  guardarPaseLista(@Body() dto: CrearPaseListaDto, @Req() req: any) {
    const usuarioId = req?.user?.sub ?? null;
    return this.asistenciasService.guardarPaseLista(dto, usuarioId);
  }

  // =========================
  // Asistencias (vista/corrección)
  // =========================

  // ✅ Ver asistencias por fecha (para corregir)
  // GET /asistencias?fecha=2026-01-05
  @Get()
  @Roles(
    Role.SUB_ACADEMICA,
    Role.SUB_ADMINISTRATIVA,
    Role.PREFECTO,
    Role.RRHH,
    Role.DIRECTOR,
    Role.JEFE_CARRERA, 
    Role.ROOT,
  )
  getAsistencias(@Query('fecha') fecha?: string) {
    if (!fecha) {
      throw new BadRequestException('fecha es requerida (YYYY-MM-DD)');
    }
    return this.asistenciasService.getAsistenciasPorFecha(fecha);
  }

  // ✅ Consultar por rango
  // GET /asistencias/rango?fechaInicio=2025-12-25&fechaFin=2026-01-05
  @Get('rango')
  @Roles(
    Role.SUB_ACADEMICA,
    Role.SUB_ADMINISTRATIVA,
    Role.PREFECTO,
    Role.RRHH,
    Role.DIRECTOR,
    Role.JEFE_CARRERA, 
    Role.ROOT,
  )
  getPorRango(@Query() q: RangoAsistenciasDto) {
    return this.asistenciasService.getPorRango(q.fechaInicio, q.fechaFin);
  }

  // ✅ Reporte por fecha
  @Get('reporte')
  @Roles(
    Role.SUB_ACADEMICA,
    Role.SUB_ADMINISTRATIVA,
    Role.PREFECTO,
    Role.RRHH,
    Role.DIRECTOR,
    Role.JEFE_CARRERA, 
    Role.ROOT,
  )
  getReporte(@Query('fecha') fecha: string) {
    return this.asistenciasService.getReportePorFecha(fecha);
  }

  // =========================
  // CRUD puntual
  // =========================

  @Get(':id')
  @Roles(
    Role.SUB_ACADEMICA,
    Role.SUB_ADMINISTRATIVA,
    Role.PREFECTO,
    Role.RRHH,
    Role.DIRECTOR,
    Role.JEFE_CARRERA, 
    Role.ROOT,
  )
  findOne(@Param('id') id: string) {
    return this.asistenciasService.findOne(+id);
  }

  // ✅ Modificación de asistencia
  @Patch(':id')
  @Roles(
    Role.PREFECTO,
    Role.RRHH,
    Role.DIRECTOR,
    Role.JEFE_CARRERA, 
    Role.ROOT,
  )
  updateAsistencia(@Param('id') id: string, @Body() dto: UpdateAsistenciaDto) {
    return this.asistenciasService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles(Role.RRHH, Role.DIRECTOR, Role.ROOT)
  remove(@Param('id') id: string) {
    return this.asistenciasService.remove(+id);
  }
}

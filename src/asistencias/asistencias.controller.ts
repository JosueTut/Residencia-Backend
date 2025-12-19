import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { CrearPaseListaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/roles.enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

// Exposición de endpoints protegidos por roles
@UseGuards( AuthGuard, RolesGuard )
@Roles(Role.PREFECTO, Role.DIRECTOR, Role.RRHH, Role.ROOT)
@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService
  ) {}

  // Ver asistencias ya tomadas por fecha (para corregir)
  @Get()
  @Roles(
    Role.SUB_ACADEMICA,
    Role.SUB_ADMINISTRATIVA,
    Role.PREFECTO,
    Role.RRHH,
    Role.DIRECTOR,
    Role.ROOT,
  )
  getAsistencias(@Query('fecha') fecha: string) {
    return this.asistenciasService.getAsistenciasPorFecha(fecha);
  }

  // Endpoint para obtener el reporte de asistencias por fecha
  @Get('reporte')
  getReporte(@Query('fecha') fecha: string) {
    return this.asistenciasService.getReportePorFecha(fecha);
  }

  // Endpoint para obtener el pase de lista de una fecha (y hora opcional)
  @Get('pase-lista')
  getPaseLista(
    @Query('fecha') fecha: string,
    @Query('hora') hora?: string,
  ) {
    return this.asistenciasService.getPaseLista(fecha, hora);
  }

  // Guardar el pase de lista (asistencias tomadas por el docente)
  @Post('pase-lista')
  async guardarPaseLista(@Body() dto: CrearPaseListaDto, @Req() req: any) {
    const usuarioId = req?.user?.sub ?? null; // viene del JWT
    return this.asistenciasService.guardarPaseLista(dto, usuarioId);
  }

  // Obtener todas las asistencias
  @Get()
  findAll() {
    return this.asistenciasService.findAll();
  }

  // Obtener asistencia por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asistenciasService.findOne(+id);
  }

  // Corregir asistencia
  @Patch(':id')
  @Roles(Role.PREFECTO, Role.RRHH, Role.DIRECTOR, Role.ROOT)
  updateAsistencia(
    @Param('id') id: string,
    @Body() dto: UpdateAsistenciaDto,
  ) {
    return this.asistenciasService.update(Number(id), dto);
  }

  // Eliminar asistencia por ID
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asistenciasService.remove(+id);
  }
}

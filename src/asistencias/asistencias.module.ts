import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciasController } from './asistencias.controller';
import { AsistenciasService } from './asistencias.service';
import { Asistencia } from './entities/asistencia.entity';
import { Horario } from 'src/horarios/entities/horario.entity';
import { Docente } from 'src/docentes/entities/docente.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asistencia, Horario, Docente]),
    forwardRef(() => AuthModule), // Para que AuthGuard tenga JwtService
  ],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService],
})
export class AsistenciasModule {}

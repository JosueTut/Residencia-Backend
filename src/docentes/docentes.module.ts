import { forwardRef, Module } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { DocentesController } from './docentes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    // Registra la entidad Docente para su uso con TypeORM
    TypeOrmModule.forFeature([Docente]),
    forwardRef(() => AuthModule), // Para que AuthGuard tenga JwtService
  ],
  controllers: [DocentesController],
  providers: [DocentesService],
  // Se exporta el servicio para que otros módulos puedan usarlo (horarios, asistencias)
  exports: [DocentesService],
})
export class DocentesModule {}

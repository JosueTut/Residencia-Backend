import { Module, forwardRef } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Horario } from './entities/horario.entity';
import { Docente } from 'src/docentes/entities/docente.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Horario, Docente]),
    forwardRef(() => AuthModule), // Para que AuthGuard tenga JwtService
  ],
  controllers: [HorariosController],
  providers: [HorariosService],
  exports: [HorariosService],
})
export class HorariosModule {}

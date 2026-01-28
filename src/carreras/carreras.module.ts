import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarrerasController } from './carreras.controller';
import { CarrerasService } from './carreras.service';
import { Carrera } from './entities/carrera.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Carrera]), 
  forwardRef(() => AuthModule), // Para que AuthGuard tenga JwtService
],
  controllers: [CarrerasController],
  providers: [CarrerasService],
  exports: [CarrerasService],
})
export class CarrerasModule {}

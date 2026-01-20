import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdificiosController } from './edificios.controller';
import { EdificiosService } from './edificios.service';
import { Edificio } from './entities/edificio.entity';
import { Salon } from './entities/salon.entity';
import { ref } from 'process';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Edificio, Salon]),
  forwardRef(() => AuthModule), // ✅ para que AuthGuard tenga JwtService
],
  controllers: [EdificiosController],
  providers: [EdificiosService],
  exports: [EdificiosService],
})
export class EdificiosModule {}

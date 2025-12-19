import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    // ✅ forwardRef rompe la dependencia circular Auth <-> Users
    forwardRef(() => UsersModule),

    // ✅ ConfigModule (ya lo tienes global en AppModule, pero no estorba)
    ConfigModule,

    // ✅ JWT configurado desde variables de entorno (.env)
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        global: true,
        secret: cfg.get<string>('JWT_SECRET')!, // JWT_SECRET es obligatorio
        signOptions: {
          expiresIn: (cfg.get<string>('JWT_EXPIRES_IN') ?? '1d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, JwtModule, AuthGuard],
})
export class AuthModule {}

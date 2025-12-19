import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DocentesModule } from './docentes/docentes.module';
import { HorariosModule } from './horarios/horarios.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    // Configuración de la conexión a la base de datos MySQL usando TypeORM
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true, // Carga automática de entidades registradas
      synchronize: process.env.DB_SYNCHRONIZE === 'true', // Sincroniza entidades con la BD (solo desarrollo)
    }),
    AuthModule,
    DocentesModule,
    HorariosModule,
    AsistenciasModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

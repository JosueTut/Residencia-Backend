import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Prefijo global para todas las rutas de la API
  // Ejemplo: http://localhost:3000/api/v1/auth/login
  app.setGlobalPrefix("api/v1");

  // Habilita CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: 'http://localhost:5173', // puerto del frontend (Vite)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Permite enviar cookies o headers de autenticación
  });

  // Configuración global de validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Lanza error si llegan campos no permitidos
      transform: true, // Convierte automáticamente tipos (string → number, etc.)
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

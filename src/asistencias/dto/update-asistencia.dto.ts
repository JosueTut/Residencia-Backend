import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoAsistencia } from '../entities/asistencia.entity';

export class UpdateAsistenciaDto {
  @IsOptional()
  @IsEnum(EstadoAsistencia)
  estado?: EstadoAsistencia;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notaAdicional?: string;
}

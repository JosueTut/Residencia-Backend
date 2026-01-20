import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TipoDocente } from '../entities/docente.entity';

export class UpdateDocenteDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  carrera?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsEnum(TipoDocente)
  tipo?: TipoDocente;
}

import { Type } from "class-transformer";
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { EstadoAsistencia } from "../entities/asistencia.entity";

export class CreateAsistenciaDto {
    
}


export class RegistroPaseListaDto {
  @IsInt()
  @IsNotEmpty()
  idHorario: number;

  // Puedes usar 'PRESENTE', 'AUSENTE', 'INCAPACIDAD', 'COMISION', etc.
  @IsString()
  @IsNotEmpty()
  @IsEnum(EstadoAsistencia)
  estado: EstadoAsistencia;

  @IsOptional()
  @IsString()
  notaAdicional?: string;
}

export class CrearPaseListaDto {
  @IsDateString()
  fecha: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistroPaseListaDto)
  registros: RegistroPaseListaDto[];
}
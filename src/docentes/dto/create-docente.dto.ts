import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { TipoDocente } from "../entities/docente.entity";

export class CreateDocenteDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    carrera: string;

    @IsEnum(TipoDocente)
    tipo: TipoDocente;
    
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateHorarioDto {
    
    @IsString()
    @IsNotEmpty()
    edificio: string;

    @IsString()
    @IsNotEmpty()
    aula: string;
    
    @IsString()
    @IsNotEmpty()
    hora_clase: string;
    
    @IsString()
    @IsNotEmpty()
    dia_semana: string;

    @IsInt()
    @IsNotEmpty()
    id_docente: number;
}

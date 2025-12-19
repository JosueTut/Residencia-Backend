import { IsNotEmpty, IsString } from "class-validator";

export class CreateDocenteDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    carrera: string;
    
}
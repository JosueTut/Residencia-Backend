import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {

    @IsString()
    // Nombre del usuario (mínimo 2 caracteres)
    @MinLength(2)
    name: string;

    // Valida que sea Correo electrónico 
    @IsEmail()
    email: string;

    @IsString()
    // Valida que tenga mínimo 6 caracteres
    @MinLength(6)
    // Elimina espacios en blanco al inicio y final
    @Transform(({ value }) => value.trim())
    password: string;
}

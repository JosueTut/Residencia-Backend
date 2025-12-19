import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {

  // Valida que el email tenga formato correcto
  @IsEmail()
  email: string;

  @IsString()
  // Valida que la contraseña sea string y mínimo de 6 caracteres
  @MinLength(6)
  // Elimina espacios en blanco al inicio y final
  @Transform(({ value }) => value.trim())
  password: string;
}

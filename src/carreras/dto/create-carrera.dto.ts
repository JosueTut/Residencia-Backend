import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCarreraDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;
}

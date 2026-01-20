import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCarreraDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;
}

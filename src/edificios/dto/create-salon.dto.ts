import { IsString, Length } from 'class-validator';

export class CreateSalonDto {
  @IsString()
  @Length(1, 60)
  nombre: string;
}

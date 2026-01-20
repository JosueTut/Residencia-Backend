import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateSalonDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  nombre?: string;
}

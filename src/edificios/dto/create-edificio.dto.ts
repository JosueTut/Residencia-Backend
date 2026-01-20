import { IsArray, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SalonCreateDto {
  @IsString()
  @Length(1, 60)
  nombre: string;
}

export class CreateEdificioDto {
  @IsString()
  @Length(1, 80)
  nombre: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalonCreateDto)
  salones?: SalonCreateDto[];
}

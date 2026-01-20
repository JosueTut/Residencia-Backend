import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateEdificioDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  nombre?: string;
}

import { IsDateString } from 'class-validator';

export class RangoAsistenciasDto {
  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;
}

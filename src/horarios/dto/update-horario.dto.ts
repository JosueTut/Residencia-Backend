import { PartialType } from '@nestjs/mapped-types';
import { CreateHorarioDto } from './create-horario.dto';
import { Horario } from '../entities/horario.entity';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateHorarioDto extends PartialType(CreateHorarioDto) {
    
    @IsString()
    @IsNotEmpty()
    edificio?: string;

    @IsString()
    @IsNotEmpty()
    aula?: string;
    
    @IsString()
    @IsNotEmpty()
    hora_clase?: string;
    
    @IsString()
    @IsNotEmpty()
    dia_semana?: string;

    @IsInt()
    @IsNotEmpty()
    id_docente?: number;
    }

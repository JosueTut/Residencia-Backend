import { Horario } from "src/horarios/entities/horario.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum TipoDocente {
  BASE = 'BASE',
  HORAS = 'HORAS',
}

@Entity('Docentes')
export class Docente {

    // Identificador único del docente (PK)
    @PrimaryGeneratedColumn()
    id_docente: number;

    // Nombre completo del docente
    @Column({ length: 150 })
    nombre: string;

    // Carrera o área académica del docente
    @Column({ length: 150 })
    carrera: string;

    @Column({
    type: 'enum',
    enum: TipoDocente,
    default: TipoDocente.HORAS,
    })
    tipo: TipoDocente;

    // Indica si el docente está activo o inactivo
    @Column({ type: 'bool', default: true })
    activo: boolean;

    // Relación: un docente puede tener varios horarios
    @OneToMany(() => Horario, (horario) => horario.docente)
    horarios: Horario[];
}

import { Docente } from "src/docentes/entities/docente.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Horarios')
export class Horario {

    // Identificador único del horario (PK)
    @PrimaryGeneratedColumn()
    id_horario: number;

    // Edificio donde se imparte la clase
    @Column()
    edificio: string;

    // Aula donde se imparte la clase
    @Column()
    aula: string;

    // Hora de la clase (ej. 08:00 - 09:00)
    @Column()
    hora_clase: string;

    // Día de la semana
    @Column()
    dia_semana: string;

    // Llave foránea del docente
    @Column()
    id_docente: number;

    // Relación muchos a uno con docentes
    @ManyToOne(() => Docente, (docente) => docente.horarios, { eager: true })
    @JoinColumn({ name: 'id_docente' })
    docente: Docente;
}

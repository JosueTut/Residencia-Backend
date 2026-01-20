import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Horario } from 'src/horarios/entities/horario.entity';
import { TipoDocente } from 'src/docentes/entities/docente.entity';

export enum EstadoAsistencia {
  PRESENTE = 'PRESENTE',
  AUSENTE = 'AUSENTE',
  INCAPACIDAD = 'INCAPACIDAD',
  COMISION = 'COMISION',
  RETARDO = 'RETARDO',
  SUSPENDIDO = 'SUSPENDIDO',
}

@Entity('Asistencias')
// ✅ OJO: id_horario ahora puede ser NULL, por lo que el UNIQUE con NULL
// en MySQL permite múltiples NULL. Eso está bien para historial cuando el horario se borra.
@Index('UQ_asistencia_fecha_horario', ['fecha', 'id_horario'], { unique: true })
export class Asistencia {
  @PrimaryGeneratedColumn()
  id_asistencia: number;

  @Column({ type: 'date' })
  fecha: string;

  // ✅ ahora es nullable (cuando se borra el horario, queda null)
  @Column({ type: 'int', nullable: true })
  id_horario: number | null;

  // ✅ IMPORTANTE: SET NULL para NO BORRAR historial
  @ManyToOne(() => Horario, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_horario' })
  horario: Horario | null;

  @Column({
    type: 'enum',
    enum: EstadoAsistencia,
    default: EstadoAsistencia.PRESENTE,
  })
  estado: EstadoAsistencia;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notaAdicional: string | null;

  @Column({ type: 'time', nullable: true })
  horaRegistro: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ==========================
  // ✅ SNAPSHOTS (docente)
  // ==========================
  @Column({ type: 'varchar', length: 150, nullable: true })
  docenteNombreSnapshot: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  docenteCarreraSnapshot: string | null;

  @Column({ type: 'enum', enum: TipoDocente, nullable: true })
  docenteTipoSnapshot: TipoDocente | null;

  // para anti-duplicados aunque se borre el horario
  @Column({ type: 'int', nullable: true })
  docenteIdSnapshot: number | null;


  // ==========================
  // ✅ SNAPSHOTS (horario)
  // ==========================
  @Column({ type: 'varchar', length: 80, nullable: true })
  edificioSnapshot: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  aulaSnapshot: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  horaClaseSnapshot: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  diaSemanaSnapshot: string | null;
}

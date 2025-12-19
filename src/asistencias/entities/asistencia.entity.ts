import {Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import { Horario } from 'src/horarios/entities/horario.entity';

  // Enum para los posibles estados de asistencia
  export enum EstadoAsistencia {
    PRESENTE = 'PRESENTE',
    AUSENTE = 'AUSENTE',
    INCAPACIDAD = 'INCAPACIDAD',
    COMISION = 'COMISION',
    RETARDO = 'RETARDO',
    SUSPENDIDO = 'SUSPENDIDO',
  }

  // Entidad Asistencia
  @Entity('Asistencias')
  @Index('UQ_asistencia_fecha_horario', ['fecha', 'id_horario'], { unique: true }) // evita duplicados
  export class Asistencia {
    @PrimaryGeneratedColumn()
    id_asistencia: number;

  // Guarda la fecha del pase de lista (solo fecha)
  @Column({ type: 'date' })
  fecha: string;

  // Guarda el id de horario como columna
  @Column({ type: 'int' })
  id_horario: number;

  // Relación con Horario
  @ManyToOne(() => Horario, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_horario' })
  horario: Horario;

  // Estado de asistencia (tipo enum)
  @Column({
    // Guarda el estado de asistencia
    type: 'enum',
    // Enum de estados posibles
    enum: EstadoAsistencia,
    // Valor por defecto
    default: EstadoAsistencia.PRESENTE,
  })
  estado: EstadoAsistencia;

  // Nota opcional
  @Column({ type: 'varchar', length: 255, nullable: true })
  notaAdicional: string | null;

  // Timestamps de creación y actualización
  @CreateDateColumn()
  createdAt: Date;

  // Fecha de última actualización
  @UpdateDateColumn()
  updatedAt: Date;
}

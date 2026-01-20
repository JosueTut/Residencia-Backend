import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'carreras' })
export class Carrera {
  @PrimaryGeneratedColumn({ name: 'id_carrera', type: 'int' })
  idCarrera: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  nombre: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

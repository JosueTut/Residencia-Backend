import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Edificio } from './edificio.entity';

@Entity('salones')
@Index(['edificioId', 'nombre'], { unique: true }) // mismo salón no se repite en el mismo edificio
export class Salon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 60 })
  nombre: string;

  @Column()
  edificioId: number;

  @ManyToOne(() => Edificio, (e) => e.salones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'edificioId' })
  edificio: Edificio;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

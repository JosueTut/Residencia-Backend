import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Salon } from './salon.entity';

@Entity('edificios')
export class Edificio {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 80 })
  nombre: string;

  @OneToMany(() => Salon, (s) => s.edificio, { cascade: true })
  salones: Salon[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

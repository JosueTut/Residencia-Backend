import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Usuarios')
export class User {

    // Identificador único del usuario (PK)
    @PrimaryGeneratedColumn()
    id: number;

    // Nombre completo del usuario
    @Column({ length: 150 })
    name: string;

    // Correo electrónico único
    @Column({ unique: true, nullable: false })
    email: string;

    // Contraseña encriptada
    @Column({ nullable: false })
    password: string;

    // Rol del usuario dentro del sistema
    @Column({ default: 'User' })
    rol: string;
}

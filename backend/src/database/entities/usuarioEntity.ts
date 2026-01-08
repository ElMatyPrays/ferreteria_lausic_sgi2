// src/database/entities/usuariosEntity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

export type RolUsuario = [1,2,3][number]; 

@Entity({ name: "usuario" })
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: "ID_usuario" })
  ID_usuario: number;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({name: "passwrd", type: "varchar", length: 255 })
  password: string;

  @Column({ type: "tinyint", default: 3 })
  rol: RolUsuario;
}

// src/database/entities/usuarioEntity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum RolUsuario {
  ADMIN = 1,
  OPERADOR = 2,
  LECTOR = 3,
}

@Entity({ name: "usuario" })
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: "ID_usuario" })
  ID_usuario!: number;

  @Index({ unique: true })
  @Column({ name: "email", type: "varchar", length: 255 })
  email!: string;

  @Column({ name: "nombre", type: "varchar", length: 120, default: "" })
  nombre!: string;

  // 👇 en BD es passwrd, en código usamos password_hash
  @Column({ name: "passwrd", type: "varchar", length: 255 })
  password_hash!: string;

  // 1 ADMIN | 2 OPERADOR | 3 LECTOR
  @Column({ name: "rol", type: "tinyint", default: RolUsuario.LECTOR })
  rol!: RolUsuario;

  @Column({ name: "activo", type: "boolean", default: true })
  activo!: boolean;

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at!: Date;
}

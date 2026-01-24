import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { VentaEntity } from "./ventaEntity";

@Entity("cliente")
export class ClienteEntity {
  @PrimaryGeneratedColumn()
  ID_cliente!: number;

  @Column({ length: 10 })
  rut!: string;

  @Column({ length: 255 })
  razon_social!: string;

  @Column({ length: 50 })
  tipo_de_compra!: string;

  @Column({ length: 255 })
  giro!: string;

  @Column({ length: 255 })
  direccion!: string;

  @Column({ length: 255 })
  comuna!: string;

  @Column({ length: 255 })
  ciudad!: string;

  @Column({ length: 255, default: "0" })
  contacto!: string;

  @Column({ type: "tinyint", default: 0 })
  tipo_descuento!: number;

  @OneToMany(() => VentaEntity, (v) => v.cliente)
  ventas!: VentaEntity[];
}

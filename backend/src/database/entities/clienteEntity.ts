import { Entity, PrimaryGeneratedColumn, Column, OneToMany,  } from "typeorm";
import { VentaEntity } from "./ventaEntity";

@Entity({ name: "cliente" })
export class ClienteEntity {
  @PrimaryGeneratedColumn()
  ID_cliente: number;

  @Column("varchar", { name: "rut", length: 10 })
  rut: string;

  @Column("varchar", { name: "razon_social", length: 255 })
  razon_social: string;

  @Column("varchar", { name: "tipo_de_compra", length: 50 })
  tipo_de_compra: string;

  @Column("varchar", { name: "giro", length: 255 })
  giro: string;

  @Column("varchar", { name: "direccion", length: 255 })
  direccion: string;

  @Column("varchar", { name: "comuna", length: 255 })
  comuna: string;

  @Column("varchar", { name: "ciudad", length: 255 })
  ciudad: string;

  @Column("varchar", { name: "contacto", length: 255 })
  contacto: string;

  @OneToMany(() => VentaEntity, venta => venta.cliente)
  ventas: VentaEntity[];
}
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { Registro_ventaEntity } from "./registro_ventaEntity";

@Entity("venta")
export class VentaEntity {
  @PrimaryGeneratedColumn()
  ID_venta: number;

  @Column("int")
  total: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP",})
  fecha: Date;

  @Column({ type: "tinyint", default: () => "0" })
  estado_pago: boolean;

  @OneToMany(() => Registro_ventaEntity, (lv) => lv.venta)
  registroVentas!: Registro_ventaEntity[];
}

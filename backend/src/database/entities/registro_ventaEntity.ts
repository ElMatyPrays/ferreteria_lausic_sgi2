// src/database/entities/lista_ventasEntity.ts
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,} from "typeorm";
import { ProductoEntity } from "./productoEntity";
import { VentaEntity } from "./ventaEntity";

@Entity({ name: "registro_venta" })
export class Registro_ventaEntity {
  @PrimaryGeneratedColumn()
  ID_registro_venta: number;

  @Column("int", { nullable: false })
  ID_producto: number;

  @Column("int", { nullable: false })
  cantidad: number;

  @Column("int", { nullable: false })
  subtotal: number;

  // FK real: ID_venta -> venta.ID_venta
  @ManyToOne(() => VentaEntity, (v) => v.registroVentas, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "ID_venta" })
  venta: VentaEntity;

  @ManyToOne(() => ProductoEntity, (p) => p.registroVenta, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "ID_producto" })
  producto: ProductoEntity;
}

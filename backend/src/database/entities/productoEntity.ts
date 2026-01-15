// src/database/entities/productoEntity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Registro_ventaEntity } from "./registro_ventaEntity";


enum UnidadMedida {
  MT = "mt",
  LT = "lt",
  UNITARIO = "unitario",
}


@Entity({ name: "producto" })
export class ProductoEntity {
  @PrimaryGeneratedColumn()
  ID_producto: number;

  @Column("varchar", { length: 255 })
  SKU: string;

  @Column("varchar", { length: 255 })
  codigo_barras: string;

  @Column("varchar", { length: 255 })
  nombre: string;

  @Column("varchar", { length: 255 })
  tipo: string;

  @Column("varchar", { length: 255 })
  variante: string;

  @Column("varchar", { length: 255 })
  marca: string;

  @Column("varchar", { length: 255 })
  proveedor: string;

  @Column("int", { nullable: false })
  precio_compra: number;  

  @Column("int", { nullable: false })
  stock: number;

  @Column({
    type: "enum",
    enum: UnidadMedida,
  })
  unidad_medida!: UnidadMedida;

  @Column("int", { nullable: false })
  precio_venta: number;

  // Inversa: un producto aparece en muchas filas de registro_venta
  @OneToMany(() => Registro_ventaEntity, (lv) => lv.producto)
  registroVenta: Registro_ventaEntity[];
}

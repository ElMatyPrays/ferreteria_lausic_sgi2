import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { Registro_ventaEntity } from "./registro_ventaEntity";
import { ClienteEntity } from "./clienteEntity";

@Entity("venta")
export class VentaEntity {
  @PrimaryGeneratedColumn()
  ID_venta: number;

  @Column("int", { name: "ID_cliente", nullable: true })
  ID_cliente: number;

  @Column("int", { name: "total", nullable: false })
  total: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP",})
  fecha: Date;

  @Column({ type: "tinyint", default: () => "0" })
  estado_pago: boolean;

  @OneToMany(() => Registro_ventaEntity, (lv) => lv.venta)
  registroVentas!: Registro_ventaEntity[];

  // Relación opcional
  @ManyToOne(() => ClienteEntity, cliente => cliente.ventas, {
    nullable: true,       // 🔑 permite null
    onDelete: "SET NULL", // 🔑 si borras cliente, no rompe la venta
  })
  @JoinColumn({ name: "ID_cliente" }) // nombre de la FK
  cliente?: ClienteEntity | null;
}

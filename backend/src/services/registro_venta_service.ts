// src/services/registro_venta_service.ts
import { AppDataSource } from "../database/dbORM";
import { Registro_ventaEntity } from "../database/entities/registro_ventaEntity";
import { VentaEntity } from "../database/entities/ventaEntity";
import { ProductoEntity } from "../database/entities/productoEntity";
import type {
  CreateRegistroVentaDTO,
  UpdateRegistroVentaDTO,
  RegistroVentaQueryDTO,
} from "../DTO/registro_ventaDTO";

export class RegistroVentaService {
  private repo() {
    return AppDataSource.getRepository(Registro_ventaEntity);
  }

  async create(dto: CreateRegistroVentaDTO) {
    if (!dto.ID_venta || Number.isNaN(Number(dto.ID_venta))) throw new Error("ID_venta es requerido");
    if (!dto.ID_producto || Number.isNaN(Number(dto.ID_producto))) throw new Error("ID_producto es requerido");
    if (dto.cantidad == null || Number.isNaN(Number(dto.cantidad)) || Number(dto.cantidad) <= 0)
      throw new Error("cantidad inválida");
    if (dto.subtotal == null || Number.isNaN(Number(dto.subtotal)) || Number(dto.subtotal) < 0)
      throw new Error("subtotal inválido");

    const ventaRepo = AppDataSource.getRepository(VentaEntity);
    const prodRepo = AppDataSource.getRepository(ProductoEntity);

    const venta = await ventaRepo.findOne({ where: { ID_venta: Number(dto.ID_venta) } });
    if (!venta) throw new Error("Venta no encontrada");

    const producto = await prodRepo.findOne({ where: { ID_producto: Number(dto.ID_producto) } });
    if (!producto) throw new Error("Producto no encontrado");

    const entity = this.repo().create({
      ID_producto: Number(dto.ID_producto),
      cantidad: Number(dto.cantidad),
      subtotal: Number(dto.subtotal),
      venta,
      producto,
    });

    return await this.repo().save(entity);
  }

  async findAll(q: RegistroVentaQueryDTO = {}) {
    const qb = this.repo().createQueryBuilder("rv");

    if (q.includeProducto) qb.leftJoinAndSelect("rv.producto", "p");
    if (q.includeVenta) qb.leftJoinAndSelect("rv.venta", "v");

    if (q.ID_venta != null) qb.andWhere("rv.ID_venta = :idv", { idv: Number(q.ID_venta) });
    if (q.ID_producto != null) qb.andWhere("rv.ID_producto = :idp", { idp: Number(q.ID_producto) });

    qb.orderBy("rv.ID_registro_venta", "DESC");
    return await qb.getMany();
  }

  async findById(id: number, relations?: { producto?: boolean; venta?: boolean }) {
    if (!id || Number.isNaN(id)) throw new Error("id inválido");

    const entity = await this.repo().findOne({
      where: { ID_registro_venta: id },
      relations: {
        producto: relations?.producto ?? false,
        venta: relations?.venta ?? false,
      },
    });

    if (!entity) throw new Error("Registro de venta no encontrado");
    return entity;
  }

  async update(id: number, dto: UpdateRegistroVentaDTO) {
    const current = await this.findById(id);

    if (dto.cantidad != null) {
      const c = Number(dto.cantidad);
      if (Number.isNaN(c) || c <= 0) throw new Error("cantidad inválida");
      current.cantidad = c;
    }

    if (dto.subtotal != null) {
      const s = Number(dto.subtotal);
      if (Number.isNaN(s) || s < 0) throw new Error("subtotal inválido");
      current.subtotal = s;
    }

    if (dto.ID_producto != null) {
      const prodRepo = AppDataSource.getRepository(ProductoEntity);
      const producto = await prodRepo.findOne({ where: { ID_producto: Number(dto.ID_producto) } });
      if (!producto) throw new Error("Producto no encontrado");
      current.ID_producto = Number(dto.ID_producto);
      current.producto = producto;
    }

    if (dto.ID_venta != null) {
      const ventaRepo = AppDataSource.getRepository(VentaEntity);
      const venta = await ventaRepo.findOne({ where: { ID_venta: Number(dto.ID_venta) } });
      if (!venta) throw new Error("Venta no encontrada");
      current.venta = venta;
    }

    return await this.repo().save(current);
  }

  async remove(id: number) {
    const entity = await this.findById(id);
    await this.repo().remove(entity);
    return { ok: true };
  }
}

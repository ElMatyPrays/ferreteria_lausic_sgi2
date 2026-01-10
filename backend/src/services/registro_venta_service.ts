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


const round2 = (n: number) => Math.round(n * 100) / 100;


export class RegistroVentaService {

  

  private repo(manager = AppDataSource.manager) {
    return manager.getRepository(Registro_ventaEntity);
  }

  private ventaRepo(manager = AppDataSource.manager) {
    return manager.getRepository(VentaEntity);
  }

  private prodRepo(manager = AppDataSource.manager) {
    return manager.getRepository(ProductoEntity);
  }

  // ✅ Recalcula total de una venta desde registro_venta
  private async recalcVentaTotal(manager: any, idVenta: number) {
    const row = await this.repo(manager)
      .createQueryBuilder("rv")
      .select("COALESCE(SUM(rv.subtotal), 0)", "total")
      .where("rv.ID_venta = :id", { id: idVenta })
      .getRawOne<{ total: string }>();

    const total = Number(row?.total ?? 0);

    await this.ventaRepo(manager).update(
      { ID_venta: idVenta } as any,
      { total } as any
    );

    return total;
  }

  // ✅ Regla: no modificar items si venta está pagada
  private async ensureVentaEditable(manager: any, idVenta: number) {
    const venta = await this.ventaRepo(manager).findOne({
      where: { ID_venta: Number(idVenta) } as any,
    });
    if (!venta) throw new Error("Venta no encontrada");
    if (venta.estado_pago === true) throw new Error("No se pueden modificar items de una venta pagada");
    return venta;
  }

  // ✅ CREATE: descuenta stock, calcula subtotal, recalcula total
  async create(dto: CreateRegistroVentaDTO) {
    if (!dto.ID_venta || Number.isNaN(Number(dto.ID_venta))) throw new Error("ID_venta es requerido");
    if (!dto.ID_producto || Number.isNaN(Number(dto.ID_producto))) throw new Error("ID_producto es requerido");
    if (dto.cantidad == null || Number.isNaN(Number(dto.cantidad)) || Number(dto.cantidad) <= 0)
      throw new Error("cantidad inválida");

    const idVenta = Number(dto.ID_venta);
    const idProducto = Number(dto.ID_producto);
    const cantidad = Number(dto.cantidad);

    return await AppDataSource.transaction(async (manager) => {
      await this.ensureVentaEditable(manager, idVenta);

      const producto = await this.prodRepo(manager).findOne({
        where: { ID_producto: idProducto } as any,
      });
      if (!producto) throw new Error("Producto no encontrado");

      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${producto.stock}, requerido: ${cantidad}`);
      }

      // ✅ calcular subtotal real
      const subtotal = round2(Number(producto.precio_venta) * cantidad);


      // ✅ descuenta stock
      producto.stock = producto.stock - cantidad;
      await this.prodRepo(manager).save(producto);

      const entity = this.repo(manager).create({
        ID_producto: idProducto,
        cantidad,
        subtotal,
        // importante: setear relación para FK ID_venta
        venta: { ID_venta: idVenta } as any,
        producto,
      } as any);

      const saved = await this.repo(manager).save(entity);

      // ✅ recalcular total de la venta
      await this.recalcVentaTotal(manager, idVenta);

      return saved;
    });
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
      where: { ID_registro_venta: id } as any,
      relations: {
        producto: relations?.producto ?? false,
        venta: relations?.venta ?? false,
      },
    });

    if (!entity) throw new Error("Registro de venta no encontrado");
    return entity;
  }

  // ✅ UPDATE: ajusta stock por delta, recalcula subtotal, recalcula total
  async update(id: number, dto: UpdateRegistroVentaDTO) {
    if (!id || Number.isNaN(id)) throw new Error("id inválido");

    return await AppDataSource.transaction(async (manager) => {
      const regRepo = this.repo(manager);
      const prodRepo = this.prodRepo(manager);

      const current = await regRepo.findOne({
        where: { ID_registro_venta: Number(id) } as any,
      });
      if (!current) throw new Error("Registro de venta no encontrado");

      const idVenta = Number((current as any).ID_venta);
      await this.ensureVentaEditable(manager, idVenta);

      const oldProductoId = Number((current as any).ID_producto);
      const oldCantidad = Number((current as any).cantidad);

      const nextProductoId =
        dto.ID_producto != null ? Number(dto.ID_producto) : oldProductoId;

      const nextCantidad =
        dto.cantidad != null ? Number(dto.cantidad) : oldCantidad;

      if (!Number.isInteger(nextProductoId) || nextProductoId <= 0) throw new Error("ID_producto inválido");
      if (!Number.isFinite(nextCantidad) || nextCantidad <= 0) throw new Error("cantidad inválida");

      // Caso 1: mismo producto
      if (nextProductoId === oldProductoId) {
        const prod = await prodRepo.findOne({ where: { ID_producto: oldProductoId } as any });
        if (!prod) throw new Error("Producto no encontrado");

        const delta = nextCantidad - oldCantidad; // + => descuenta más, - => devuelve
        if (delta > 0 && prod.stock < delta) {
          throw new Error(`Stock insuficiente. Disponible: ${prod.stock}, requerido extra: ${delta}`);
        }

        prod.stock = prod.stock - delta;
        await prodRepo.save(prod);

        (current as any).cantidad = nextCantidad;
        (current as any).subtotal = Number(prod.precio_venta) * nextCantidad;

        const saved = await regRepo.save(current);
        await this.recalcVentaTotal(manager, idVenta);
        return saved;
      }

      // Caso 2: cambió producto
      const oldProd = await prodRepo.findOne({ where: { ID_producto: oldProductoId } as any });
      if (!oldProd) throw new Error("Producto anterior no encontrado");

      const newProd = await prodRepo.findOne({ where: { ID_producto: nextProductoId } as any });
      if (!newProd) throw new Error("Producto nuevo no encontrado");

      // devolver stock al producto viejo
      oldProd.stock = oldProd.stock + oldCantidad;
      await prodRepo.save(oldProd);

      // descontar stock del producto nuevo
      if (newProd.stock < nextCantidad) {
        throw new Error(`Stock insuficiente en nuevo producto. Disponible: ${newProd.stock}, requerido: ${nextCantidad}`);
      }
      newProd.stock = newProd.stock - nextCantidad;
      await prodRepo.save(newProd);

      (current as any).ID_producto = nextProductoId;
      (current as any).producto = newProd;
      (current as any).cantidad = nextCantidad;
      (current as any).subtotal = Number(newProd.precio_venta) * nextCantidad;

      const saved = await regRepo.save(current);
      await this.recalcVentaTotal(manager, idVenta);
      return saved;
    });
  }

  // ✅ DELETE: devuelve stock, recalcula total
  async remove(id: number) {
    if (!id || Number.isNaN(id)) throw new Error("id inválido");

    return await AppDataSource.transaction(async (manager) => {
      const regRepo = this.repo(manager);
      const prodRepo = this.prodRepo(manager);

      const entity = await regRepo.findOne({
        where: { ID_registro_venta: Number(id) } as any,
      });
      if (!entity) throw new Error("Registro de venta no encontrado");

      const idVenta = Number((entity as any).ID_venta);
      await this.ensureVentaEditable(manager, idVenta);

      const prod = await prodRepo.findOne({
        where: { ID_producto: Number((entity as any).ID_producto) } as any,
      });
      if (!prod) throw new Error("Producto no encontrado");

      // devolver stock
      prod.stock = prod.stock + Number((entity as any).cantidad);
      await prodRepo.save(prod);

      await regRepo.remove(entity);

      // recalcula total venta
      await this.recalcVentaTotal(manager, idVenta);

      return { ok: true };
    });
  }
}

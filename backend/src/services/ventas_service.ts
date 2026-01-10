// src/services/venta_service.ts
import { AppDataSource } from "../database/dbORM";
import { VentaEntity } from "../database/entities/ventaEntity";
import { Registro_ventaEntity } from "../database/entities/registro_ventaEntity";
import { ProductoEntity } from "../database/entities/productoEntity";
import type {
  CreateVentaDTO,
  UpdateVentaDTO,
  VentaQueryDTO,
  CreateVentaConItemsDTO,
} from "../DTO/ventaDTO";

export class VentasService {
  private repo() {
    return AppDataSource.getRepository(VentaEntity);
  }

  async create(dto: CreateVentaDTO) {
    if (dto.total == null || Number.isNaN(Number(dto.total))) throw new Error("total es requerido");
    if (Number(dto.total) < 0) throw new Error("total no puede ser negativo");

    const entity = this.repo().create({
      total: Number(dto.total),
      estado_pago: dto.estado_pago ?? false,
      fecha: dto.fecha ? new Date(dto.fecha) : undefined,
    });

    return await this.repo().save(entity);
  }

  async findAll(q: VentaQueryDTO = {}) {
    const qb = this.repo().createQueryBuilder("v");

    if (q.includeItems) {
      qb.leftJoinAndSelect("v.registroVentas", "rv");
      // si quieres incluir producto:
      // qb.leftJoinAndSelect("rv.producto", "p");
    }

    if (typeof q.estado_pago === "boolean") {
      qb.andWhere("v.estado_pago = :estado", { estado: q.estado_pago ? 1 : 0 });
    }

    if (q.from) qb.andWhere("v.fecha >= :from", { from: new Date(q.from) });
    if (q.to) qb.andWhere("v.fecha <= :to", { to: new Date(q.to) });

    if (q.q?.trim()) {
      const term = q.q.trim();
      const asNum = Number(term);
      if (!Number.isNaN(asNum)) {
        qb.andWhere("(v.ID_venta = :id OR v.total = :total)", { id: asNum, total: asNum });
      }
    }

    qb.orderBy("v.ID_venta", "DESC");
    return await qb.getMany();
  }

  async findById(id: number, includeItems = false) {
    if (!id || Number.isNaN(id)) throw new Error("id inválido");

    if (includeItems) {
      const venta = await this.repo().findOne({
        where: { ID_venta: id },
        relations: { registroVentas: true },
      });
      if (!venta) throw new Error("Venta no encontrada");
      return venta;
    }

    const venta = await this.repo().findOne({ where: { ID_venta: id } });
    if (!venta) throw new Error("Venta no encontrada");
    return venta;
  }

  async update(id: number, dto: UpdateVentaDTO) {
    const venta = await this.findById(id, false);

    if (dto.total != null) {
      const t = Number(dto.total);
      if (Number.isNaN(t)) throw new Error("total inválido");
      if (t < 0) throw new Error("total no puede ser negativo");
      venta.total = t;
    }

    if (dto.fecha != null) venta.fecha = new Date(dto.fecha);
    if (dto.estado_pago != null) venta.estado_pago = Boolean(dto.estado_pago);

    return await this.repo().save(venta);
  }

  async remove(id: number) {
    const venta = await this.findById(id, false);
    await this.repo().remove(venta); // CASCADE borra registros
    return { ok: true };
  }

  /**
   * ✅ Crea una venta y sus items, y DESCUNTA STOCK.
   * - total/subtotales se calculan con precio_venta
   * - valida existencia + stock suficiente
   * - transacción: si falla algo, rollback completo
   */
  async createConItems(dto: CreateVentaConItemsDTO) {
    if (!dto.items?.length) throw new Error("items es requerido y no puede venir vacío");

    for (const [i, it] of dto.items.entries()) {
      if (it.ID_producto == null || Number.isNaN(Number(it.ID_producto))) {
        throw new Error(`items[${i}].ID_producto inválido`);
      }
      if (it.cantidad == null || Number.isNaN(Number(it.cantidad)) || Number(it.cantidad) <= 0) {
        throw new Error(`items[${i}].cantidad inválida`);
      }
    }

    return await AppDataSource.transaction(async (manager) => {
      const ventaRepo = manager.getRepository(VentaEntity);
      const regRepo = manager.getRepository(Registro_ventaEntity);
      const prodRepo = manager.getRepository(ProductoEntity);

      // 1) Traer productos involucrados
      const ids = dto.items.map((i) => Number(i.ID_producto));
      const productos = await prodRepo
        .createQueryBuilder("p")
        .where("p.ID_producto IN (:...ids)", { ids })
        .getMany();

      const mapProd = new Map(productos.map((p) => [p.ID_producto, p]));

      // 2) Sumar cantidades por producto (por si se repite en items)
      const qtyPorProducto = new Map<number, number>();
      for (const it of dto.items) {
        const idp = Number(it.ID_producto);
        const qty = Number(it.cantidad);
        qtyPorProducto.set(idp, (qtyPorProducto.get(idp) ?? 0) + qty);
      }

      // 3) Validar existencia + stock suficiente
      for (const [idp, qtyTotal] of qtyPorProducto.entries()) {
        const prod = mapProd.get(idp);
        if (!prod) throw new Error(`Producto no encontrado (ID_producto=${idp})`);
        if (prod.stock < qtyTotal) {
          throw new Error(
            `Stock insuficiente para "${prod.nombre}" (ID=${idp}). Disponible: ${prod.stock}, requerido: ${qtyTotal}`
          );
        }
      }

      // 4) Normalizar items calculando subtotal desde precio_venta
      const itemsNormalizados = dto.items.map((it) => {
        const prod = mapProd.get(Number(it.ID_producto))!;
        const cantidad = Number(it.cantidad);
        const subtotal = prod.precio_venta * cantidad;

        // Si viene subtotal, validarlo (opcional)
        if (it.subtotal != null && Number(it.subtotal) !== subtotal) {
          throw new Error(
            `Subtotal inválido para producto ID=${prod.ID_producto}. Esperado: ${subtotal}, recibido: ${it.subtotal}`
          );
        }

        return {
          producto: prod,
          ID_producto: prod.ID_producto,
          cantidad,
          subtotal,
        };
      });

      const total = itemsNormalizados.reduce((acc, it) => acc + it.subtotal, 0);

      // 5) Crear venta
      const venta = ventaRepo.create({
        total,
        estado_pago: dto.estado_pago ?? false,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      });

      const savedVenta = await ventaRepo.save(venta);

      // 6) Descontar stock
      for (const [idp, qtyTotal] of qtyPorProducto.entries()) {
        const prod = mapProd.get(idp)!;
        prod.stock = prod.stock - qtyTotal;
      }
      await prodRepo.save([...mapProd.values()]);

      // 7) Crear registros
      const registros = itemsNormalizados.map((it) =>
        regRepo.create({
          ID_producto: it.ID_producto,
          cantidad: it.cantidad,
          subtotal: it.subtotal,
          venta: savedVenta,
          producto: it.producto,
        })
      );

      await regRepo.save(registros);

      // 8) Devolver venta con items
      const full = await ventaRepo.findOne({
        where: { ID_venta: savedVenta.ID_venta },
        relations: { registroVentas: true },
      });

      return full ?? savedVenta;
    });
  }
}

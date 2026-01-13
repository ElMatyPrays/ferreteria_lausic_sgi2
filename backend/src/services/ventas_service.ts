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

const IVA_RATE = 0.19;

export class VentasService {
  /* =========================
     Helpers
  ========================== */

  private repo() {
    return AppDataSource.getRepository(VentaEntity);
  }

  private normalizeIdCliente(v: any): number | null | undefined {
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;

    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error("ID_cliente inválido");
    return n;
  }

  private precioConIVA(precio: number, conIVA: boolean): number {
    if (!conIVA) return precio;
    return Math.round(precio * (1 + IVA_RATE));
  }

  private ivaUnitario(precio: number, conIVA: boolean): number {
    if (!conIVA) return 0;
    return Math.round(precio * IVA_RATE);
  }

  private async recalcTotalFromItems(idVenta: number) {
    const regRepo = AppDataSource.getRepository(Registro_ventaEntity);

    const row = await regRepo
      .createQueryBuilder("rv")
      .select("COALESCE(SUM(rv.subtotal), 0)", "total")
      .where("rv.ID_venta = :id", { id: idVenta })
      .getRawOne<{ total: string }>();

    return Number(row?.total ?? 0);
  }

  /* =========================
     CRUD Venta simple
  ========================== */

  async create(dto: CreateVentaDTO) {
    if (dto.total == null || Number.isNaN(Number(dto.total))) {
      throw new Error("total es requerido");
    }
    if (Number(dto.total) < 0) {
      throw new Error("total no puede ser negativo");
    }

    const entity = this.repo().create({
      ID_cliente: dto.ID_cliente ?? null,
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
    }

    if (typeof q.estado_pago === "boolean") {
      qb.andWhere("v.estado_pago = :estado", { estado: q.estado_pago ? 1 : 0 });
    }

    if (q.from) qb.andWhere("v.fecha >= :from", { from: new Date(q.from) });
    if (q.to) qb.andWhere("v.fecha <= :to", { to: new Date(q.to) });

    qb.orderBy("v.fecha", "ASC").addOrderBy("v.ID_venta", "ASC");
    return await qb.getMany();
  }

  async findById(id: number, includeItems = false) {
    if (!id || Number.isNaN(id)) throw new Error("id inválido");

    const venta = await this.repo().findOne({
      where: { ID_venta: id },
      relations: includeItems ? { registroVentas: true } : undefined,
    });

    if (!venta) throw new Error("Venta no encontrada");
    return venta;
  }

  async update(id: number, dto: UpdateVentaDTO) {
    const venta = await this.findById(id, false);

    const idClienteNorm = this.normalizeIdCliente((dto as any).ID_cliente);
    if (idClienteNorm !== undefined) venta.ID_cliente = idClienteNorm;

    const tieneItems = await AppDataSource
      .getRepository(Registro_ventaEntity)
      .exist({ where: { ID_venta: id } as any });

    if (dto.fecha != null) venta.fecha = new Date(dto.fecha);
    if (dto.estado_pago != null) venta.estado_pago = Boolean(dto.estado_pago);

    if (tieneItems) {
      venta.total = await this.recalcTotalFromItems(id);
    } else if (dto.total != null) {
      const t = Number(dto.total);
      if (Number.isNaN(t) || t < 0) throw new Error("total inválido");
      venta.total = t;
    }

    return await this.repo().save(venta);
  }

  async remove(id: number) {
    const venta = await this.findById(id, false);
    if (venta.estado_pago === true) {
      throw new Error("No se puede eliminar una venta pagada");
    }
    await this.repo().remove(venta);
    return { ok: true };
  }

  /* =========================
     Crear venta con items + IVA TOTAL
  ========================== */

  async createConItems(dto: CreateVentaConItemsDTO) {
    if (!dto.items?.length) {
      throw new Error("items es requerido y no puede venir vacío");
    }

    const conIVA = (dto as any).con_iva === true;

    return await AppDataSource.transaction(async (manager) => {
      const ventaRepo = manager.getRepository(VentaEntity);
      const regRepo = manager.getRepository(Registro_ventaEntity);
      const prodRepo = manager.getRepository(ProductoEntity);

      /* 1) Productos */
      const ids = dto.items.map((i) => Number(i.ID_producto));
      const productos = await prodRepo
        .createQueryBuilder("p")
        .where("p.ID_producto IN (:...ids)", { ids })
        .getMany();

      const mapProd = new Map(productos.map((p) => [p.ID_producto, p]));

      /* 2) Cantidades */
      const qtyPorProducto = new Map<number, number>();
      for (const it of dto.items) {
        const idp = Number(it.ID_producto);
        qtyPorProducto.set(idp, (qtyPorProducto.get(idp) ?? 0) + Number(it.cantidad));
      }

      /* 3) Validar stock */
      for (const [idp, qty] of qtyPorProducto.entries()) {
        const prod = mapProd.get(idp);
        if (!prod) throw new Error(`Producto no encontrado (ID=${idp})`);
        if (prod.stock < qty) {
          throw new Error(`Stock insuficiente para "${prod.nombre}"`);
        }
      }

      /* 4) Normalizar items + IVA */
      let ivaTotal = 0;

      const itemsNormalizados = dto.items.map((it) => {
        const prod = mapProd.get(Number(it.ID_producto))!;
        const cantidad = Number(it.cantidad);

        const ivaUnit = this.ivaUnitario(prod.precio_venta, conIVA);
        ivaTotal += ivaUnit * cantidad;

        const precioFinal = this.precioConIVA(prod.precio_venta, conIVA);
        const subtotal = precioFinal * cantidad;

        return {
          producto: prod,
          ID_producto: prod.ID_producto,
          cantidad,
          subtotal,
        };
      });

      const total = itemsNormalizados.reduce((a, i) => a + i.subtotal, 0);

      /* 5) Crear venta */
      const venta = ventaRepo.create({
        ID_cliente: this.normalizeIdCliente((dto as any).ID_cliente) ?? null,
        total,
        estado_pago: dto.estado_pago ?? false,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      });

      const savedVenta = await ventaRepo.save(venta);

      /* 6) Descontar stock */
      for (const [idp, qty] of qtyPorProducto.entries()) {
        mapProd.get(idp)!.stock -= qty;
      }
      await prodRepo.save([...mapProd.values()]);

      /* 7) Crear registros */
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

      /* 8) Retorno enriquecido */
      const ventaCompleta = await ventaRepo.findOne({
        where: { ID_venta: savedVenta.ID_venta },
        relations: { registroVentas: true },
      });

      return {
        ...ventaCompleta,
        iva_total: ivaTotal,
        con_iva: conIVA,
      };
    });
  }
}

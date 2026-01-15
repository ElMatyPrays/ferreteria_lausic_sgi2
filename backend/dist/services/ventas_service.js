"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentasService = void 0;
// src/services/venta_service.ts
const dbORM_1 = require("../database/dbORM");
const ventaEntity_1 = require("../database/entities/ventaEntity");
const registro_ventaEntity_1 = require("../database/entities/registro_ventaEntity");
const productoEntity_1 = require("../database/entities/productoEntity");
class VentasService {
    normalizeIdCliente(v) {
        if (v === undefined)
            return undefined;
        if (v === null || v === "")
            return null;
        const n = Number(v);
        if (!Number.isInteger(n) || n <= 0)
            throw new Error("ID_cliente inválido");
        return n;
    }
    async recalcTotalFromItems(idVenta) {
        const regRepo = dbORM_1.AppDataSource.getRepository(registro_ventaEntity_1.Registro_ventaEntity);
        const row = await regRepo
            .createQueryBuilder("rv")
            .select("COALESCE(SUM(rv.subtotal), 0)", "total")
            .where("rv.ID_venta = :id", { id: idVenta })
            .getRawOne();
        return Number(row?.total ?? 0);
    }
    repo() {
        return dbORM_1.AppDataSource.getRepository(ventaEntity_1.VentaEntity);
    }
    async create(dto) {
        if (dto.total == null || Number.isNaN(Number(dto.total)))
            throw new Error("total es requerido");
        if (Number(dto.total) < 0)
            throw new Error("total no puede ser negativo");
        const entity = this.repo().create({
            ID_cliente: dto.ID_cliente ?? null,
            total: Number(dto.total),
            estado_pago: dto.estado_pago ?? false,
            fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        });
        return await this.repo().save(entity);
    }
    async findAll(q = {}) {
        const qb = this.repo().createQueryBuilder("v");
        if (q.includeItems) {
            qb.leftJoinAndSelect("v.registroVentas", "rv");
        }
        if (typeof q.estado_pago === "boolean") {
            qb.andWhere("v.estado_pago = :estado", { estado: q.estado_pago ? 1 : 0 });
        }
        if (q.from)
            qb.andWhere("v.fecha >= :from", { from: new Date(q.from) });
        if (q.to)
            qb.andWhere("v.fecha <= :to", { to: new Date(q.to) });
        if (q.q?.trim()) {
            const term = q.q.trim();
            const asNum = Number(term);
            if (!Number.isNaN(asNum)) {
                qb.andWhere("(v.ID_venta = :id OR v.total = :total)", {
                    id: asNum,
                    total: asNum,
                });
            }
        }
        qb.orderBy("v.fecha", "ASC").addOrderBy("v.ID_venta", "ASC");
        return await qb.getMany();
    }
    async findById(id, includeItems = false) {
        if (!id || Number.isNaN(id))
            throw new Error("id inválido");
        if (includeItems) {
            const venta = await this.repo().findOne({
                where: { ID_venta: id },
                relations: { registroVentas: true },
            });
            if (!venta)
                throw new Error("Venta no encontrada");
            return venta;
        }
        const venta = await this.repo().findOne({ where: { ID_venta: id } });
        if (!venta)
            throw new Error("Venta no encontrada");
        return venta;
    }
    async update(id, dto) {
        const venta = await this.findById(id, false);
        const idClienteNorm = this.normalizeIdCliente(dto.ID_cliente);
        if (idClienteNorm !== undefined) {
            venta.ID_cliente = idClienteNorm;
        }
        const tieneItems = await dbORM_1.AppDataSource
            .getRepository(registro_ventaEntity_1.Registro_ventaEntity)
            .exist({ where: { ID_venta: id } });
        if (dto.fecha != null)
            venta.fecha = new Date(dto.fecha);
        if (dto.estado_pago != null)
            venta.estado_pago = Boolean(dto.estado_pago);
        if (tieneItems) {
            venta.total = await this.recalcTotalFromItems(id);
        }
        else if (dto.total != null) {
            const t = Number(dto.total);
            if (Number.isNaN(t))
                throw new Error("total inválido");
            if (t < 0)
                throw new Error("total no puede ser negativo");
            venta.total = t;
        }
        return await this.repo().save(venta);
    }
    async remove(id) {
        const venta = await this.findById(id, false);
        if (venta.estado_pago === true) {
            throw new Error("No se puede eliminar una venta pagada");
        }
        await this.repo().remove(venta);
        return { ok: true };
    }
    /**
     * ✅ Crea una venta con items y descuenta stock
     * - FACTURA: máximo 9 productos distintos
     */
    async createConItems(dto) {
        if (!dto.items?.length)
            throw new Error("items es requerido y no puede venir vacío");
        const IVA = 0.19;
        const modoIva = dto.modo_iva === "neto" ? "neto" : "incluye_iva";
        // ✅ tipo documento
        const tipo = dto.tipo_documento === "factura" ? "factura" : "boleta";
        // ✅ VALIDACIÓN: máximo 9 productos distintos en FACTURA
        if (tipo === "factura") {
            const productosDistintos = new Set(dto.items.map((i) => Number(i.ID_producto)));
            if (productosDistintos.size > 9) {
                throw new Error("Una factura solo puede contener hasta 9 productos distintos. Debes dividir la venta en otra factura.");
            }
        }
        // Validación básica de items
        for (const [i, it] of dto.items.entries()) {
            if (it.ID_producto == null || Number.isNaN(Number(it.ID_producto))) {
                throw new Error(`items[${i}].ID_producto inválido`);
            }
            if (it.cantidad == null || Number(it.cantidad) <= 0) {
                throw new Error(`items[${i}].cantidad inválida`);
            }
        }
        return await dbORM_1.AppDataSource.transaction(async (manager) => {
            const ventaRepo = manager.getRepository(ventaEntity_1.VentaEntity);
            const regRepo = manager.getRepository(registro_ventaEntity_1.Registro_ventaEntity);
            const prodRepo = manager.getRepository(productoEntity_1.ProductoEntity);
            const idClienteNorm = this.normalizeIdCliente(dto.ID_cliente) ?? null;
            if (tipo === "factura" && !idClienteNorm) {
                throw new Error("Para Factura debes seleccionar un cliente");
            }
            const ids = dto.items.map((i) => Number(i.ID_producto));
            const productos = await prodRepo
                .createQueryBuilder("p")
                .where("p.ID_producto IN (:...ids)", { ids })
                .getMany();
            const mapProd = new Map(productos.map((p) => [p.ID_producto, p]));
            const qtyPorProducto = new Map();
            for (const it of dto.items) {
                const idp = Number(it.ID_producto);
                qtyPorProducto.set(idp, (qtyPorProducto.get(idp) ?? 0) + Number(it.cantidad));
            }
            for (const [idp, qty] of qtyPorProducto.entries()) {
                const prod = mapProd.get(idp);
                if (!prod)
                    throw new Error(`Producto no encontrado (ID=${idp})`);
                if (prod.stock < qty) {
                    throw new Error(`Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}, requerido: ${qty}`);
                }
            }
            const itemsNormalizados = dto.items.map((it) => {
                const prod = mapProd.get(Number(it.ID_producto));
                const cantidad = Number(it.cantidad);
                const base = prod.precio_venta * cantidad;
                const subtotal = modoIva === "neto"
                    ? Math.round(base * (1 + IVA))
                    : base;
                return {
                    producto: prod,
                    ID_producto: prod.ID_producto,
                    cantidad,
                    subtotal,
                };
            });
            const total = itemsNormalizados.reduce((a, b) => a + b.subtotal, 0);
            const venta = ventaRepo.create({
                tipo_documento: tipo,
                modo_iva: modoIva,
                ID_cliente: tipo === "factura" ? idClienteNorm : null,
                total,
                estado_pago: dto.estado_pago ?? false,
                fecha: dto.fecha ? new Date(dto.fecha) : undefined,
            });
            const savedVenta = await ventaRepo.save(venta);
            for (const [idp, qty] of qtyPorProducto.entries()) {
                const prod = mapProd.get(idp);
                prod.stock -= qty;
            }
            await prodRepo.save([...mapProd.values()]);
            const registros = itemsNormalizados.map((it) => regRepo.create({
                ID_producto: it.ID_producto,
                cantidad: it.cantidad,
                subtotal: it.subtotal,
                venta: savedVenta,
                producto: it.producto,
            }));
            await regRepo.save(registros);
            return await ventaRepo.findOne({
                where: { ID_venta: savedVenta.ID_venta },
                relations: { registroVentas: true },
            });
        });
    }
    /**
   * ✅ Devuelve una venta lista para imprimir (items + producto + cliente)
   * Calcula resumen neto/iva solo si conIva = true y modo_iva = "neto"
   */
    async getVentaParaImprimir(idVenta, conIvaOverride) {
        if (!idVenta || Number.isNaN(Number(idVenta)))
            throw new Error("id_venta inválido");
        const venta = await this.repo().findOne({
            where: { ID_venta: idVenta },
            relations: {
                cliente: true,
                registroVentas: { producto: true },
            },
        });
        if (!venta)
            throw new Error("Venta no encontrada");
        const IVA = 0.19;
        // si viene override lo respetamos; si no, por defecto:
        // - boleta: false
        // - factura: true (porque normalmente quieres desglose)
        const conIvaFinal = typeof conIvaOverride === "boolean"
            ? conIvaOverride
            : venta.tipo_documento === "factura";
        // Resumen: si modo_iva = neto y conIvaFinal true => desglosa
        const total = Number(venta.total ?? 0);
        let resumen;
        if (conIvaFinal && venta.modo_iva === "neto") {
            const neto = Math.round(total / (1 + IVA));
            const iva = total - neto;
            resumen = { neto, iva, total };
        }
        else {
            resumen = { neto: total, iva: 0, total };
        }
        return { venta, resumen, conIva: conIvaFinal };
    }
}
exports.VentasService = VentasService;
//# sourceMappingURL=ventas_service.js.map
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
        // undefined = no venía en el body => no tocar
        if (v === undefined)
            return undefined;
        // null = explícitamente quitar cliente
        if (v === null || v === "")
            return null;
        const n = Number(v);
        if (!Number.isInteger(n) || n <= 0)
            throw new Error("ID_cliente inválido");
        return n;
    }
    async recalcTotalFromItems(idVenta) {
        const regRepo = dbORM_1.AppDataSource.getRepository(registro_ventaEntity_1.Registro_ventaEntity);
        // suma de subtotales de la venta
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
            // si quieres incluir producto:
            // qb.leftJoinAndSelect("rv.producto", "p");
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
                qb.andWhere("(v.ID_venta = :id OR v.total = :total)", { id: asNum, total: asNum });
            }
        }
        // ✅ orden natural: antiguo arriba, nuevo abajo
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
        // ✅ actualizar ID_cliente si viene
        const idClienteNorm = this.normalizeIdCliente(dto.ID_cliente);
        if (idClienteNorm !== undefined) {
            venta.ID_cliente = idClienteNorm; // number | null
        }
        const tieneItems = await dbORM_1.AppDataSource.getRepository(registro_ventaEntity_1.Registro_ventaEntity).exist({
            where: { ID_venta: id },
        });
        if (dto.fecha != null)
            venta.fecha = new Date(dto.fecha);
        if (dto.estado_pago != null)
            venta.estado_pago = Boolean(dto.estado_pago);
        if (tieneItems) {
            venta.total = await this.recalcTotalFromItems(id);
        }
        else {
            if (dto.total != null) {
                const t = Number(dto.total);
                if (Number.isNaN(t))
                    throw new Error("total inválido");
                if (t < 0)
                    throw new Error("total no puede ser negativo");
                venta.total = t;
            }
        }
        return await this.repo().save(venta);
    }
    async remove(id) {
        const venta = await this.findById(id, false);
        // 🚫 regla de negocio: no permitir borrar pagadas
        if (venta.estado_pago === true) {
            throw new Error("No se puede eliminar una venta pagada");
        }
        await this.repo().remove(venta); // CASCADE borra registros
        return { ok: true };
    }
    /**
     * ✅ Crea una venta y sus items, y DESCUNTA STOCK.
     * - total/subtotales se calculan con precio_venta
     * - valida existencia + stock suficiente
     * - transacción: si falla algo, rollback completo
     */
    async createConItems(dto) {
        if (!dto.items?.length)
            throw new Error("items es requerido y no puede venir vacío");
        const IVA = 0.19;
        const modoIva = dto.modo_iva === "neto" ? "neto" : "incluye_iva";
        // Validación básica de items
        for (const [i, it] of dto.items.entries()) {
            if (it.ID_producto == null || Number.isNaN(Number(it.ID_producto))) {
                throw new Error(`items[${i}].ID_producto inválido`);
            }
            if (it.cantidad == null || Number.isNaN(Number(it.cantidad)) || Number(it.cantidad) <= 0) {
                throw new Error(`items[${i}].cantidad inválida`);
            }
        }
        return await dbORM_1.AppDataSource.transaction(async (manager) => {
            const ventaRepo = manager.getRepository(ventaEntity_1.VentaEntity);
            const regRepo = manager.getRepository(registro_ventaEntity_1.Registro_ventaEntity);
            const prodRepo = manager.getRepository(productoEntity_1.ProductoEntity);
            // ✅ tipo documento
            const tipo = dto.tipo_documento === "factura" ? "factura" : "boleta";
            // ✅ normalizar cliente + reglas
            const idClienteNorm = this.normalizeIdCliente(dto.ID_cliente) ?? null;
            if (tipo === "factura" && !idClienteNorm) {
                throw new Error("Para Factura debes seleccionar un cliente");
            }
            // 1) Traer productos
            const ids = dto.items.map((i) => Number(i.ID_producto));
            const productos = await prodRepo
                .createQueryBuilder("p")
                .where("p.ID_producto IN (:...ids)", { ids })
                .getMany();
            const mapProd = new Map(productos.map((p) => [p.ID_producto, p]));
            // 2) Sumar cantidades por producto
            const qtyPorProducto = new Map();
            for (const it of dto.items) {
                const idp = Number(it.ID_producto);
                const qty = Number(it.cantidad);
                qtyPorProducto.set(idp, (qtyPorProducto.get(idp) ?? 0) + qty);
            }
            // 3) Validar existencia + stock suficiente
            for (const [idp, qtyTotal] of qtyPorProducto.entries()) {
                const prod = mapProd.get(idp);
                if (!prod)
                    throw new Error(`Producto no encontrado (ID_producto=${idp})`);
                if (prod.stock < qtyTotal) {
                    throw new Error(`Stock insuficiente para "${prod.nombre}" (ID=${idp}). Disponible: ${prod.stock}, requerido: ${qtyTotal}`);
                }
            }
            // 4) Normalizar items calculando subtotal
            const itemsNormalizados = dto.items.map((it) => {
                const prod = mapProd.get(Number(it.ID_producto));
                const cantidad = Number(it.cantidad);
                const base = prod.precio_venta * cantidad;
                const subtotal = modoIva === "neto"
                    ? Math.round(base * (1 + IVA)) // neto -> cobras con IVA
                    : base; // incluye IVA -> cobras tal cual
                if (it.subtotal != null && Number(it.subtotal) !== subtotal) {
                    throw new Error(`Subtotal inválido para producto ID=${prod.ID_producto}. Esperado: ${subtotal}, recibido: ${it.subtotal}`);
                }
                return {
                    producto: prod,
                    ID_producto: prod.ID_producto,
                    cantidad,
                    subtotal,
                };
            });
            const total = itemsNormalizados.reduce((acc, it) => acc + it.subtotal, 0);
            // 5) Crear venta (✅ con tipo_documento + regla cliente)
            const venta = ventaRepo.create({
                tipo_documento: tipo,
                modo_iva: modoIva,
                ID_cliente: tipo === "factura" ? idClienteNorm : null,
                total,
                estado_pago: dto.estado_pago ?? false,
                fecha: dto.fecha ? new Date(dto.fecha) : undefined,
            });
            const savedVenta = await ventaRepo.save(venta);
            // 6) Descontar stock
            for (const [idp, qtyTotal] of qtyPorProducto.entries()) {
                const prod = mapProd.get(idp);
                prod.stock = prod.stock - qtyTotal;
            }
            await prodRepo.save([...mapProd.values()]);
            // 7) Crear registros
            const registros = itemsNormalizados.map((it) => regRepo.create({
                ID_producto: it.ID_producto,
                cantidad: it.cantidad,
                subtotal: it.subtotal,
                venta: savedVenta,
                producto: it.producto,
            }));
            await regRepo.save(registros);
            // 8) Devolver venta con items
            const full = await ventaRepo.findOne({
                where: { ID_venta: savedVenta.ID_venta },
                relations: { registroVentas: true },
            });
            return full ?? savedVenta;
        });
    }
    // ✅ helper: calcula neto/iva desde un total "final"
    calcResumen(total, conIva, tasa = 0.19) {
        const t = Math.round(Number(total) || 0);
        if (!conIva) {
            return { neto: t, iva: 0, total: t };
        }
        const neto = Math.round(t / (1 + tasa));
        const iva = t - neto;
        return { neto, iva, total: t };
    }
    /**
     * ✅ Venta lista para imprimir / mostrar resumen
     * - trae venta + registroVentas + producto
     * - genera resumen con IVA o sin IVA (según parámetro)
     */
    async getVentaParaImprimir(idVenta, conIva) {
        if (!idVenta || Number.isNaN(Number(idVenta)))
            throw new Error("idVenta inválido");
        const ventaRepo = this.repo();
        const venta = await ventaRepo.findOne({
            where: { ID_venta: idVenta },
            relations: { registroVentas: { producto: true } }, // 👈 importante
        });
        if (!venta)
            throw new Error("Venta no encontrada");
        // ✅ si no te mandan conIva, decisión por tipo_documento:
        // - boleta: normalmente NO desglosas (conIva=false)
        // - factura: normalmente SI desglosas (conIva=true)
        const modoIva = venta.modo_iva ?? "incluye_iva";
        const conIvaFinal = typeof conIva === "boolean"
            ? conIva
            : venta.tipo_documento === "factura";
        const resumen = this.calcResumen(venta.total, conIvaFinal);
        return { venta, resumen, conIva: conIvaFinal, modoIva: venta.modo_iva ?? "incluye_iva" };
    }
}
exports.VentasService = VentasService;
//# sourceMappingURL=ventas_service.js.map
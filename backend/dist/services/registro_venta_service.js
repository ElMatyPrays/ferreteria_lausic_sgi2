"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistroVentaService = void 0;
// src/services/registro_venta_service.ts
const dbORM_1 = require("../database/dbORM");
const registro_ventaEntity_1 = require("../database/entities/registro_ventaEntity");
const ventaEntity_1 = require("../database/entities/ventaEntity");
const productoEntity_1 = require("../database/entities/productoEntity");
const round2 = (n) => Math.round(n * 100) / 100;
class RegistroVentaService {
    repo(manager = dbORM_1.AppDataSource.manager) {
        return manager.getRepository(registro_ventaEntity_1.Registro_ventaEntity);
    }
    ventaRepo(manager = dbORM_1.AppDataSource.manager) {
        return manager.getRepository(ventaEntity_1.VentaEntity);
    }
    prodRepo(manager = dbORM_1.AppDataSource.manager) {
        return manager.getRepository(productoEntity_1.ProductoEntity);
    }
    // ✅ Recalcula total de una venta desde registro_venta
    async recalcVentaTotal(manager, idVenta) {
        const row = await this.repo(manager)
            .createQueryBuilder("rv")
            .select("COALESCE(SUM(rv.subtotal), 0)", "total")
            .where("rv.ID_venta = :id", { id: idVenta })
            .getRawOne();
        const total = Number(row?.total ?? 0);
        await this.ventaRepo(manager).update({ ID_venta: idVenta }, { total });
        return total;
    }
    // ✅ Regla: no modificar items si venta está pagada
    async ensureVentaEditable(manager, idVenta) {
        const venta = await this.ventaRepo(manager).findOne({
            where: { ID_venta: Number(idVenta) },
        });
        if (!venta)
            throw new Error("Venta no encontrada");
        if (venta.estado_pago === true)
            throw new Error("No se pueden modificar items de una venta pagada");
        return venta;
    }
    // ✅ CREATE: descuenta stock, calcula subtotal, recalcula total
    async create(dto) {
        if (!dto.ID_venta || Number.isNaN(Number(dto.ID_venta)))
            throw new Error("ID_venta es requerido");
        if (!dto.ID_producto || Number.isNaN(Number(dto.ID_producto)))
            throw new Error("ID_producto es requerido");
        if (dto.cantidad == null || Number.isNaN(Number(dto.cantidad)) || Number(dto.cantidad) <= 0)
            throw new Error("cantidad inválida");
        const idVenta = Number(dto.ID_venta);
        const idProducto = Number(dto.ID_producto);
        const cantidad = Number(dto.cantidad);
        return await dbORM_1.AppDataSource.transaction(async (manager) => {
            await this.ensureVentaEditable(manager, idVenta);
            const producto = await this.prodRepo(manager).findOne({
                where: { ID_producto: idProducto },
            });
            if (!producto)
                throw new Error("Producto no encontrado");
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
                venta: { ID_venta: idVenta },
                producto,
            });
            const saved = await this.repo(manager).save(entity);
            // ✅ recalcular total de la venta
            await this.recalcVentaTotal(manager, idVenta);
            return saved;
        });
    }
    async findAll(q = {}) {
        const qb = this.repo().createQueryBuilder("rv");
        if (q.includeProducto)
            qb.leftJoinAndSelect("rv.producto", "p");
        if (q.includeVenta)
            qb.leftJoinAndSelect("rv.venta", "v");
        if (q.ID_venta != null)
            qb.andWhere("rv.ID_venta = :idv", { idv: Number(q.ID_venta) });
        if (q.ID_producto != null)
            qb.andWhere("rv.ID_producto = :idp", { idp: Number(q.ID_producto) });
        qb.orderBy("rv.ID_registro_venta", "DESC");
        return await qb.getMany();
    }
    async findById(id, relations) {
        if (!id || Number.isNaN(id))
            throw new Error("id inválido");
        const entity = await this.repo().findOne({
            where: { ID_registro_venta: id },
            relations: {
                producto: relations?.producto ?? false,
                venta: relations?.venta ?? false,
            },
        });
        if (!entity)
            throw new Error("Registro de venta no encontrado");
        return entity;
    }
    // ✅ UPDATE: ajusta stock por delta, recalcula subtotal, recalcula total
    async update(id, dto) {
        if (!id || Number.isNaN(id))
            throw new Error("id inválido");
        return await dbORM_1.AppDataSource.transaction(async (manager) => {
            const regRepo = this.repo(manager);
            const prodRepo = this.prodRepo(manager);
            const current = await regRepo.findOne({
                where: { ID_registro_venta: Number(id) },
            });
            if (!current)
                throw new Error("Registro de venta no encontrado");
            const idVenta = Number(current.ID_venta);
            await this.ensureVentaEditable(manager, idVenta);
            const oldProductoId = Number(current.ID_producto);
            const oldCantidad = Number(current.cantidad);
            const nextProductoId = dto.ID_producto != null ? Number(dto.ID_producto) : oldProductoId;
            const nextCantidad = dto.cantidad != null ? Number(dto.cantidad) : oldCantidad;
            if (!Number.isInteger(nextProductoId) || nextProductoId <= 0)
                throw new Error("ID_producto inválido");
            if (!Number.isFinite(nextCantidad) || nextCantidad <= 0)
                throw new Error("cantidad inválida");
            // Caso 1: mismo producto
            if (nextProductoId === oldProductoId) {
                const prod = await prodRepo.findOne({ where: { ID_producto: oldProductoId } });
                if (!prod)
                    throw new Error("Producto no encontrado");
                const delta = nextCantidad - oldCantidad; // + => descuenta más, - => devuelve
                if (delta > 0 && prod.stock < delta) {
                    throw new Error(`Stock insuficiente. Disponible: ${prod.stock}, requerido extra: ${delta}`);
                }
                prod.stock = prod.stock - delta;
                await prodRepo.save(prod);
                current.cantidad = nextCantidad;
                current.subtotal = Number(prod.precio_venta) * nextCantidad;
                const saved = await regRepo.save(current);
                await this.recalcVentaTotal(manager, idVenta);
                return saved;
            }
            // Caso 2: cambió producto
            const oldProd = await prodRepo.findOne({ where: { ID_producto: oldProductoId } });
            if (!oldProd)
                throw new Error("Producto anterior no encontrado");
            const newProd = await prodRepo.findOne({ where: { ID_producto: nextProductoId } });
            if (!newProd)
                throw new Error("Producto nuevo no encontrado");
            // devolver stock al producto viejo
            oldProd.stock = oldProd.stock + oldCantidad;
            await prodRepo.save(oldProd);
            // descontar stock del producto nuevo
            if (newProd.stock < nextCantidad) {
                throw new Error(`Stock insuficiente en nuevo producto. Disponible: ${newProd.stock}, requerido: ${nextCantidad}`);
            }
            newProd.stock = newProd.stock - nextCantidad;
            await prodRepo.save(newProd);
            current.ID_producto = nextProductoId;
            current.producto = newProd;
            current.cantidad = nextCantidad;
            current.subtotal = Number(newProd.precio_venta) * nextCantidad;
            const saved = await regRepo.save(current);
            await this.recalcVentaTotal(manager, idVenta);
            return saved;
        });
    }
    // ✅ DELETE: devuelve stock, recalcula total
    async remove(id) {
        if (!id || Number.isNaN(id))
            throw new Error("id inválido");
        return await dbORM_1.AppDataSource.transaction(async (manager) => {
            const regRepo = this.repo(manager);
            const prodRepo = this.prodRepo(manager);
            const entity = await regRepo.findOne({
                where: { ID_registro_venta: Number(id) },
            });
            if (!entity)
                throw new Error("Registro de venta no encontrado");
            const idVenta = Number(entity.ID_venta);
            await this.ensureVentaEditable(manager, idVenta);
            const prod = await prodRepo.findOne({
                where: { ID_producto: Number(entity.ID_producto) },
            });
            if (!prod)
                throw new Error("Producto no encontrado");
            // devolver stock
            prod.stock = prod.stock + Number(entity.cantidad);
            await prodRepo.save(prod);
            await regRepo.remove(entity);
            // recalcula total venta
            await this.recalcVentaTotal(manager, idVenta);
            return { ok: true };
        });
    }
}
exports.RegistroVentaService = RegistroVentaService;
//# sourceMappingURL=registro_venta_service.js.map
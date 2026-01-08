"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductosService = void 0;
const dbORM_1 = require("../database/dbORM");
const productoEntity_1 = require("../database/entities/productoEntity");
class ProductosService {
    repo() {
        return dbORM_1.AppDataSource.getRepository(productoEntity_1.ProductoEntity);
    }
    async create(dto) {
        if (!dto.SKU?.trim())
            throw new Error("SKU es requerido");
        if (!dto.codigo_barras?.trim())
            throw new Error("codigo_barras es requerido");
        if (!dto.nombre?.trim())
            throw new Error("nombre es requerido");
        const entity = this.repo().create({
            SKU: dto.SKU.trim(),
            codigo_barras: dto.codigo_barras.trim(),
            nombre: dto.nombre.trim(),
            tipo: dto.tipo?.trim() ?? "",
            variante: dto.variante?.trim() ?? "",
            marca: dto.marca?.trim() ?? "",
            proveedor: dto.proveedor?.trim() ?? "",
            precio_compra: dto.precio_compra,
            stock: dto.stock,
            precio_venta: dto.precio_venta,
        });
        return await this.repo().save(entity);
    }
    async findAll(opts) {
        const q = opts?.q?.trim();
        if (!q) {
            return await this.repo().find({ order: { ID_producto: "DESC" } });
        }
        return await this.repo()
            .createQueryBuilder("p")
            .where("p.nombre LIKE :q", { q: `%${q}%` })
            .orWhere("p.SKU LIKE :q", { q: `%${q}%` })
            .orWhere("p.codigo_barras LIKE :q", { q: `%${q}%` })
            .orderBy("p.ID_producto", "DESC")
            .getMany();
    }
    async findById(id) {
        const item = await this.repo().findOne({ where: { ID_producto: id } });
        if (!item)
            throw new Error("Producto no encontrado");
        return item;
    }
    async update(id, dto) {
        const item = await this.findById(id);
        if (dto.SKU !== undefined)
            item.SKU = dto.SKU.trim();
        if (dto.codigo_barras !== undefined)
            item.codigo_barras = dto.codigo_barras.trim();
        if (dto.nombre !== undefined)
            item.nombre = dto.nombre.trim();
        if (dto.tipo !== undefined)
            item.tipo = dto.tipo.trim();
        if (dto.variante !== undefined)
            item.variante = dto.variante.trim();
        if (dto.marca !== undefined)
            item.marca = dto.marca.trim();
        if (dto.proveedor !== undefined)
            item.proveedor = dto.proveedor.trim();
        if (dto.precio_compra !== undefined)
            item.precio_compra = dto.precio_compra;
        if (dto.stock !== undefined)
            item.stock = dto.stock;
        if (dto.precio_venta !== undefined)
            item.precio_venta = dto.precio_venta;
        return await this.repo().save(item);
    }
    async remove(id) {
        const item = await this.findById(id);
        await this.repo().remove(item);
        return { ok: true };
    }
}
exports.ProductosService = ProductosService;
//# sourceMappingURL=producto_service.js.map
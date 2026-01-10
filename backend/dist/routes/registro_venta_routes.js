"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registroVentaRouter = void 0;
// src/routes/registro_venta_routes.ts
const express_1 = require("express");
const registro_venta_service_1 = require("../services/registro_venta_service");
exports.registroVentaRouter = (0, express_1.Router)();
const service = new registro_venta_service_1.RegistroVentaService();
// CREATE
exports.registroVentaRouter.post("/", async (req, res) => {
    try {
        const created = await service.create(req.body);
        res.status(201).json(created);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al crear registro de venta" });
    }
});
// READ ALL (filtros)
exports.registroVentaRouter.get("/", async (req, res) => {
    try {
        const ID_venta = typeof req.query.ID_venta === "string" ? Number(req.query.ID_venta) : undefined;
        const ID_producto = typeof req.query.ID_producto === "string" ? Number(req.query.ID_producto) : undefined;
        const includeProducto = typeof req.query.includeProducto === "string"
            ? req.query.includeProducto === "1" || req.query.includeProducto.toLowerCase() === "true"
            : false;
        const includeVenta = typeof req.query.includeVenta === "string"
            ? req.query.includeVenta === "1" || req.query.includeVenta.toLowerCase() === "true"
            : false;
        const items = await service.findAll({ ID_venta, ID_producto, includeProducto, includeVenta });
        res.json(items);
    }
    catch (e) {
        res.status(500).json({ message: e?.message ?? "Error al listar registros de venta" });
    }
});
// READ ONE
exports.registroVentaRouter.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const includeProducto = typeof req.query.includeProducto === "string"
            ? req.query.includeProducto === "1" || req.query.includeProducto.toLowerCase() === "true"
            : false;
        const includeVenta = typeof req.query.includeVenta === "string"
            ? req.query.includeVenta === "1" || req.query.includeVenta.toLowerCase() === "true"
            : false;
        const item = await service.findById(id, { producto: includeProducto, venta: includeVenta });
        res.json(item);
    }
    catch (e) {
        res.status(404).json({ message: e?.message ?? "Registro de venta no encontrado" });
    }
});
// UPDATE
exports.registroVentaRouter.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await service.update(id, req.body);
        res.json(updated);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al actualizar registro de venta" });
    }
});
// DELETE
exports.registroVentaRouter.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const out = await service.remove(id);
        res.json(out);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al eliminar registro de venta" });
    }
});
//# sourceMappingURL=registro_venta_routes.js.map
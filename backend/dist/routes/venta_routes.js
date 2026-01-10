"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ventasRouter = void 0;
// src/routes/venta_routes.ts
const express_1 = require("express");
const ventas_service_1 = require("../services/ventas_service");
exports.ventasRouter = (0, express_1.Router)();
const service = new ventas_service_1.VentasService();
// CREATE venta simple
exports.ventasRouter.post("/", async (req, res) => {
    try {
        const created = await service.create(req.body);
        res.status(201).json(created);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al crear venta" });
    }
});
// ✅ CREATE venta con items (registro_venta) en una sola transacción
exports.ventasRouter.post("/con-items", async (req, res) => {
    try {
        const created = await service.createConItems(req.body);
        res.status(201).json(created);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al crear venta con items" });
    }
});
// READ ALL (filtros por query)
exports.ventasRouter.get("/", async (req, res) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q : undefined;
        const from = typeof req.query.from === "string" ? req.query.from : undefined;
        const to = typeof req.query.to === "string" ? req.query.to : undefined;
        const estado_pago = typeof req.query.estado_pago === "string"
            ? req.query.estado_pago === "1" || req.query.estado_pago.toLowerCase() === "true"
            : undefined;
        const includeItems = typeof req.query.includeItems === "string"
            ? req.query.includeItems === "1" || req.query.includeItems.toLowerCase() === "true"
            : false;
        const items = await service.findAll({ q, from, to, estado_pago, includeItems });
        res.json(items);
    }
    catch (e) {
        res.status(500).json({ message: e?.message ?? "Error al listar ventas" });
    }
});
// READ ONE
exports.ventasRouter.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const includeItems = typeof req.query.includeItems === "string"
            ? req.query.includeItems === "1" || req.query.includeItems.toLowerCase() === "true"
            : false;
        const item = await service.findById(id, includeItems);
        res.json(item);
    }
    catch (e) {
        res.status(404).json({ message: e?.message ?? "Venta no encontrada" });
    }
});
// UPDATE
exports.ventasRouter.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await service.update(id, req.body);
        res.json(updated);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al actualizar venta" });
    }
});
// DELETE
exports.ventasRouter.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const out = await service.remove(id);
        res.json(out);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al eliminar venta" });
    }
});
//# sourceMappingURL=venta_routes.js.map
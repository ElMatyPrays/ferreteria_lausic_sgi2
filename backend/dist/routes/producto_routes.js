"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productosRouter = void 0;
const express_1 = require("express");
const producto_service_1 = require("../services/producto_service");
exports.productosRouter = (0, express_1.Router)();
const service = new producto_service_1.ProductosService();
// CREATE
exports.productosRouter.post("/", async (req, res) => {
    try {
        const created = await service.create(req.body);
        res.status(201).json(created);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al crear producto" });
    }
});
// READ ALL (con ?q=)
exports.productosRouter.get("/", async (req, res) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q : undefined;
        const items = await service.findAll({ q });
        res.json(items);
    }
    catch (e) {
        res.status(500).json({ message: e?.message ?? "Error al listar productos" });
    }
});
// READ ONE
exports.productosRouter.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const item = await service.findById(id);
        res.json(item);
    }
    catch (e) {
        res.status(404).json({ message: e?.message ?? "No encontrado" });
    }
});
// UPDATE
exports.productosRouter.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await service.update(id, req.body);
        res.json(updated);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al actualizar" });
    }
});
// DELETE
exports.productosRouter.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const out = await service.remove(id);
        res.json(out);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al eliminar" });
    }
});
//# sourceMappingURL=producto_routes.js.map
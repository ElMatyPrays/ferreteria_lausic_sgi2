"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientesRouter = void 0;
const express_1 = require("express");
const cliente_service_1 = require("../services/cliente_service");
exports.clientesRouter = (0, express_1.Router)();
const service = new cliente_service_1.ClientesService();
// CREATE
exports.clientesRouter.post("/", async (req, res) => {
    try {
        const created = await service.create(req.body);
        res.status(201).json(created);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al crear cliente" });
    }
});
// READ ALL (opcional: ?q=)
exports.clientesRouter.get("/", async (req, res) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q : undefined;
        const items = await service.findAll({ q });
        res.json(items);
    }
    catch (e) {
        res.status(500).json({ message: e?.message ?? "Error al listar clientes" });
    }
});
// READ ONE
exports.clientesRouter.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const item = await service.findById(id);
        res.json(item);
    }
    catch (e) {
        res.status(404).json({ message: e?.message ?? "Cliente no encontrado" });
    }
});
// UPDATE
exports.clientesRouter.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await service.update(id, req.body);
        res.json(updated);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al actualizar cliente" });
    }
});
// DELETE
exports.clientesRouter.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const out = await service.remove(id);
        res.json(out);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al eliminar cliente" });
    }
});
//# sourceMappingURL=cliente_routes.js.map
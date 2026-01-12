"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuariosRouter = void 0;
// src/routes/usuarios.routes.ts
const express_1 = require("express");
const usuarios_service_1 = require("../services/usuarios_service");
const auth_1 = require("../middlewares/auth");
const usuarioEntity_1 = require("../database/entities/usuarioEntity");
exports.usuariosRouter = (0, express_1.Router)();
const service = new usuarios_service_1.UsuariosService();
// 🔒 Todo lo de usuarios requiere login + ser ADMIN
exports.usuariosRouter.use(auth_1.authRequired);
exports.usuariosRouter.use((0, auth_1.requireRoles)([usuarioEntity_1.RolUsuario.ADMIN]));
// GET /api/usuarios?q=
exports.usuariosRouter.get("/", async (req, res) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q : undefined;
        const items = await service.findAll(q);
        res.json(items);
    }
    catch (e) {
        res.status(500).json({ message: e?.message ?? "Error al listar usuarios" });
    }
});
// GET /api/usuarios/:id
exports.usuariosRouter.get("/:id", async (req, res) => {
    try {
        const ID_usuario = Number(req.params.id);
        const item = await service.findById(ID_usuario);
        res.json(item);
    }
    catch (e) {
        res.status(404).json({ message: e?.message ?? "Usuario no encontrado" });
    }
});
// POST /api/usuarios
exports.usuariosRouter.post("/", async (req, res) => {
    try {
        const created = await service.create(req.body);
        res.status(201).json(created);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al crear usuario" });
    }
});
// PUT /api/usuarios/:id
exports.usuariosRouter.put("/:id", async (req, res) => {
    try {
        const ID_usuario = Number(req.params.id);
        const updated = await service.update(ID_usuario, req.body);
        res.json(updated);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al actualizar usuario" });
    }
});
// DELETE /api/usuarios/:id
exports.usuariosRouter.delete("/:id", async (req, res) => {
    try {
        const ID_usuario = Number(req.params.id);
        const out = await service.remove(ID_usuario);
        res.json(out);
    }
    catch (e) {
        res.status(400).json({ message: e?.message ?? "Error al eliminar usuario" });
    }
});
//# sourceMappingURL=usuarios.routes.js.map
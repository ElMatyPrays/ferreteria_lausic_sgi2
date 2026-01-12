// src/routes/usuarios.routes.ts
import { Router } from "express";
import { UsuariosService } from "../services/usuarios_service";
import { authRequired, requireRoles } from "../middlewares/auth";
import { RolUsuario } from "../database/entities/usuarioEntity";

export const usuariosRouter = Router();
const service = new UsuariosService();

// 🔒 Todo lo de usuarios requiere login + ser ADMIN
usuariosRouter.use(authRequired);
usuariosRouter.use(requireRoles([RolUsuario.ADMIN]));

// GET /api/usuarios?q=
usuariosRouter.get("/", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const items = await service.findAll(q);
    res.json(items);
  } catch (e: any) {
    res.status(500).json({ message: e?.message ?? "Error al listar usuarios" });
  }
});

// GET /api/usuarios/:id
usuariosRouter.get("/:id", async (req, res) => {
  try {
    const ID_usuario = Number(req.params.id);
    const item = await service.findById(ID_usuario);
    res.json(item);
  } catch (e: any) {
    res.status(404).json({ message: e?.message ?? "Usuario no encontrado" });
  }
});

// POST /api/usuarios
usuariosRouter.post("/", async (req, res) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Error al crear usuario" });
  }
});

// PUT /api/usuarios/:id
usuariosRouter.put("/:id", async (req, res) => {
  try {
    const ID_usuario = Number(req.params.id);
    const updated = await service.update(ID_usuario, req.body);
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Error al actualizar usuario" });
  }
});

// DELETE /api/usuarios/:id
usuariosRouter.delete("/:id", async (req, res) => {
  try {
    const ID_usuario = Number(req.params.id);
    const out = await service.remove(ID_usuario);
    res.json(out);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Error al eliminar usuario" });
  }
});

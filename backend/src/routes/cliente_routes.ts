import { Router } from "express";
import { ClientesService } from "../services/cliente_service";

export const clientesRouter = Router();
const service = new ClientesService();

// CREATE
clientesRouter.post("/", async (req, res) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Error al crear cliente" });
  }
});

// READ ALL (opcional: ?q=)
clientesRouter.get("/", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const items = await service.findAll({ q });
    res.json(items);
  } catch (e: any) {
    res.status(500).json({ message: e?.message ?? "Error al listar clientes" });
  }
});

// READ ONE
clientesRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await service.findById(id);
    res.json(item);
  } catch (e: any) {
    res.status(404).json({ message: e?.message ?? "Cliente no encontrado" });
  }
});

// UPDATE
clientesRouter.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await service.update(id, req.body);
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Error al actualizar cliente" });
  }
});

// DELETE
clientesRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const out = await service.remove(id);
    res.json(out);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Error al eliminar cliente" });
  }
});

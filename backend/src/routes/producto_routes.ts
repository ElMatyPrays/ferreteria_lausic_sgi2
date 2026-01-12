import { Router } from "express";
import { ProductosService } from "../services/producto_service";

export const productosRouter = Router();
const service = new ProductosService();

// CREATE
productosRouter.post("/", async (req, res) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Error al crear producto" });
  }
});

// READ ALL (con ?q=)
productosRouter.get("/", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const items = await service.findAll({ q });
    res.json(items);
  } catch (e: any) {
    res.status(500).json({ message: e?.message ?? "Error al listar productos" });
  }
});

// READ ONE
productosRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await service.findById(id);
    res.json(item);
  } catch (e: any) {
    res.status(404).json({ message: e?.message ?? "No encontrado" });
  }
});

// UPDATE
productosRouter.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await service.update(id, req.body);
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Error al actualizar" });
  }
});

// DELETE
productosRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const out = await service.remove(id);
    res.json(out);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Error al eliminar" });
  }
});

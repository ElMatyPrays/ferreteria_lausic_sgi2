// src/routes/auth.routes.ts
import { Router } from "express";
import { UsuariosService } from "../services/usuarios_service";
import { signToken } from "../utils/jwt";
import { authRequired } from "../middlewares/auth";

export const authRouter = Router();
const users = new UsuariosService();

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ message: "Faltan credenciales" });

    const user = await users.validateLogin(email, password);

    const token = signToken({
      ID_usuario: user.ID_usuario,
      email: user.email,
      rol: user.rol, // 1/2/3
    });

    return res.json({ ok: true, token, user });
  } catch (e: any) {
    return res.status(401).json({ message: e?.message ?? "No autorizado" });
  }
});

// GET /api/auth/me
authRouter.get("/me", authRequired, async (req, res) => {
  try {
    const full = await users.findById(req.user!.ID_usuario);
    return res.json({ ok: true, user: full });
  } catch (e: any) {
    return res.status(401).json({ message: e?.message ?? "No autorizado" });
  }
});

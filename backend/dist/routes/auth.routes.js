"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
// src/routes/auth.routes.ts
const express_1 = require("express");
const usuarios_service_1 = require("../services/usuarios_service");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middlewares/auth");
exports.authRouter = (0, express_1.Router)();
const users = new usuarios_service_1.UsuariosService();
// POST /api/auth/login
exports.authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        if (!email || !password)
            return res.status(400).json({ message: "Faltan credenciales" });
        const user = await users.validateLogin(email, password);
        const token = (0, jwt_1.signToken)({
            ID_usuario: user.ID_usuario,
            email: user.email,
            rol: user.rol, // 1/2/3
        });
        return res.json({ ok: true, token, user });
    }
    catch (e) {
        return res.status(401).json({ message: e?.message ?? "No autorizado" });
    }
});
// GET /api/auth/me
exports.authRouter.get("/me", auth_1.authRequired, async (req, res) => {
    try {
        const full = await users.findById(req.user.ID_usuario);
        return res.json({ ok: true, user: full });
    }
    catch (e) {
        return res.status(401).json({ message: e?.message ?? "No autorizado" });
    }
});
//# sourceMappingURL=auth.routes.js.map
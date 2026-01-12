"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = seedAdmin;
// src/seed/seed_admin.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbORM_1 = require("../database/dbORM");
const usuarioEntity_1 = require("../database/entities/usuarioEntity");
async function seedAdmin() {
    const repo = dbORM_1.AppDataSource.getRepository(usuarioEntity_1.UsuarioEntity);
    const email = (process.env.SEED_ADMIN_EMAIL || "admin@creaciones.local").toLowerCase();
    const pass = process.env.SEED_ADMIN_PASSWORD || "admin123";
    const nombre = process.env.SEED_ADMIN_NOMBRE || "Administrador";
    const exists = await repo.findOne({ where: { email } });
    if (exists)
        return;
    const hash = await bcrypt_1.default.hash(pass, 10);
    const u = repo.create({
        email,
        nombre,
        password_hash: hash,
        rol: usuarioEntity_1.RolUsuario.ADMIN,
        activo: true,
    });
    await repo.save(u);
    console.log(`✅ Admin creado: ${email} / ${pass}`);
}
//# sourceMappingURL=seed_admin.js.map
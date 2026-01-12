"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbORM_1 = require("../database/dbORM");
const usuarioEntity_1 = require("../database/entities/usuarioEntity");
function toSafe(u) {
    const { password_hash, ...rest } = u;
    return rest;
}
class UsuariosService {
    constructor() {
        this.repo = dbORM_1.AppDataSource.getRepository(usuarioEntity_1.UsuarioEntity);
    }
    async findAll(q) {
        const qb = this.repo.createQueryBuilder("u");
        if (q)
            qb.where("u.email LIKE :q OR u.nombre LIKE :q", { q: `%${q}%` });
        const items = await qb.orderBy("u.ID_usuario", "ASC").getMany();
        return items.map(toSafe);
    }
    async findById(ID_usuario) {
        const u = await this.repo.findOne({ where: { ID_usuario } });
        if (!u)
            throw new Error("Usuario no encontrado");
        return toSafe(u);
    }
    async create(input) {
        const email = input.email.trim().toLowerCase();
        const exists = await this.repo.findOne({ where: { email } });
        if (exists)
            throw new Error("El email ya existe");
        const hash = await bcrypt_1.default.hash(input.password, 10);
        const u = this.repo.create({
            email,
            nombre: input.nombre?.trim() ?? "",
            password_hash: hash,
            rol: input.rol ?? usuarioEntity_1.RolUsuario.LECTOR,
            activo: input.activo ?? true,
        });
        const saved = await this.repo.save(u);
        return toSafe(saved);
    }
    async update(ID_usuario, input) {
        const u = await this.repo.findOne({ where: { ID_usuario } });
        if (!u)
            throw new Error("Usuario no encontrado");
        if (typeof input.email === "string") {
            const email = input.email.trim().toLowerCase();
            if (email !== u.email) {
                const exists = await this.repo.findOne({ where: { email } });
                if (exists)
                    throw new Error("El email ya existe");
            }
            u.email = email;
        }
        if (typeof input.nombre === "string")
            u.nombre = input.nombre.trim(); // ✅ faltaba
        if (typeof input.rol === "number")
            u.rol = input.rol;
        if (typeof input.activo === "boolean")
            u.activo = input.activo;
        if (typeof input.password === "string" && input.password.length > 0) {
            u.password_hash = await bcrypt_1.default.hash(input.password, 10);
        }
        const saved = await this.repo.save(u);
        return toSafe(saved);
    }
    async remove(ID_usuario) {
        const u = await this.repo.findOne({ where: { ID_usuario } });
        if (!u)
            throw new Error("Usuario no encontrado");
        await this.repo.remove(u);
        return { ok: true };
    }
    async validateLogin(email, password) {
        const u = await this.repo.findOne({ where: { email: email.trim().toLowerCase() } });
        if (!u)
            throw new Error("Credenciales inválidas");
        if (!u.activo)
            throw new Error("Usuario desactivado");
        const ok = await bcrypt_1.default.compare(password, u.password_hash);
        if (!ok)
            throw new Error("Credenciales inválidas");
        return toSafe(u);
    }
}
exports.UsuariosService = UsuariosService;
//# sourceMappingURL=usuarios_service.js.map
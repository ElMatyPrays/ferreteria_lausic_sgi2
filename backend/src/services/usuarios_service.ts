// src/services/usuarios_service.ts
import bcrypt from "bcryptjs";
import { AppDataSource } from "../database/dbORM";
import { UsuarioEntity, RolUsuario } from "../database/entities/usuarioEntity";

export type UsuarioSafe = {
  ID_usuario: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
};

function toSafe(u: UsuarioEntity): UsuarioSafe {
  const { password_hash, ...rest } = u as any;
  return rest as UsuarioSafe;
}

export class UsuariosService {
  private repo = AppDataSource.getRepository(UsuarioEntity);

  async findAll(q?: string): Promise<UsuarioSafe[]> {
    const qb = this.repo.createQueryBuilder("u");
    if (q) qb.where("u.email LIKE :q OR u.nombre LIKE :q", { q: `%${q}%` });
    const items = await qb.orderBy("u.ID_usuario", "ASC").getMany();
    return items.map(toSafe);
  }

  async findById(ID_usuario: number): Promise<UsuarioSafe> {
    const u = await this.repo.findOne({ where: { ID_usuario } });
    if (!u) throw new Error("Usuario no encontrado");
    return toSafe(u);
  }

  async create(input: {
   email: string;
   nombre: string;
   password: string;
   rol?: RolUsuario;
   activo?: boolean;
  }): Promise<UsuarioSafe> {

    // --- 🔴 VALIDACIÓN NUEVA (INICIO) ---
    if (!input.email || !input.email.trim()) {
      throw new Error("El email es obligatorio");
    }
    if (!input.password || !input.password.trim()) {
      throw new Error("La contraseña es obligatoria");
    }
    // --- 🔴 VALIDACIÓN NUEVA (FIN) ---

    const email = input.email.trim().toLowerCase();

    const exists = await this.repo.findOne({ where: { email } });
    if (exists) throw new Error("El email ya existe");

    const hash = await bcrypt.hash(input.password, 10);

    const u = this.repo.create({
      email,
      nombre: input.nombre?.trim() ?? "",
      password_hash: hash,
      rol: input.rol ?? RolUsuario.LECTOR,
      activo: input.activo ?? true,
    });

    const saved = await this.repo.save(u);
    return toSafe(saved);
  }

  async update(
    ID_usuario: number,
    input: Partial<{ email: string; nombre: string; password: string; rol: RolUsuario; activo: boolean }>
  ): Promise<UsuarioSafe> {
    const u = await this.repo.findOne({ where: { ID_usuario } });
    if (!u) throw new Error("Usuario no encontrado");

    if (typeof input.email === "string") {
      const email = input.email.trim().toLowerCase();
      if (email !== u.email) {
        const exists = await this.repo.findOne({ where: { email } });
        if (exists) throw new Error("El email ya existe");
      }
      u.email = email;
    }

    if (typeof input.nombre === "string") u.nombre = input.nombre.trim(); // ✅ faltaba
    if (typeof input.rol === "number") u.rol = input.rol;
    if (typeof input.activo === "boolean") u.activo = input.activo;

    if (typeof input.password === "string" && input.password.length > 0) {
      u.password_hash = await bcrypt.hash(input.password, 10);
    }

    const saved = await this.repo.save(u);
    return toSafe(saved);
  }

  async remove(ID_usuario: number) {
    const u = await this.repo.findOne({ where: { ID_usuario } });
    if (!u) throw new Error("Usuario no encontrado");
    await this.repo.remove(u);
    return { ok: true };
  }

  async validateLogin(email: string, password: string): Promise<UsuarioSafe> {
    const u = await this.repo.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!u) throw new Error("Credenciales inválidas");
    if (!u.activo) throw new Error("Usuario desactivado");

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) throw new Error("Credenciales inválidas");

    return toSafe(u);
  }
}

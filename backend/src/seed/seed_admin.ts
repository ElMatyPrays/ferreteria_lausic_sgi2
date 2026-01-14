// src/seed/seed_admin.ts
import bcrypt from "bcrypt";
import { AppDataSource } from "../database/dbORM";
import { UsuarioEntity, RolUsuario } from "../database/entities/usuarioEntity";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`❌ Falta variable de entorno: ${name}`);
  return v.trim();
}

export async function seedAdmin() {
  // Recomendado: activar seed solo si tú lo dices explícitamente
  // (evita que en producción se cree por accidente)
  const enabled = (process.env.SEED_ADMIN_ENABLED || "").toLowerCase() === "true";
  if (!enabled) return;

  const repo = AppDataSource.getRepository(UsuarioEntity);

  // En producción: sin defaults (obligatorio por env)
  const email = mustEnv("SEED_ADMIN_EMAIL").toLowerCase();
  const pass = mustEnv("SEED_ADMIN_PASSWORD");
  const nombre = process.env.SEED_ADMIN_NOMBRE?.trim() || "Administrador";

  const exists = await repo.findOne({ where: { email } });
  if (exists) {
    console.log(`ℹ️ Seed admin: ya existe ${email}, no se crea de nuevo.`);
    return;
  }

  // Buena práctica: fuerza mínima de password (simple, pero sirve)
  if (pass.length < 10) {
    throw new Error("❌ SEED_ADMIN_PASSWORD muy corta (mínimo 10 caracteres).");
  }

  const hash = await bcrypt.hash(pass, 10);

  const u = repo.create({
    email,
    nombre,
    password_hash: hash,
    rol: RolUsuario.ADMIN,
    activo: true,
  });

  await repo.save(u);

  // Nunca imprimir password
  console.log(`✅ Admin inicial creado: ${email}`);
}

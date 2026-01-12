// src/seed/seed_admin.ts
import bcrypt from "bcrypt";
import { AppDataSource } from "../database/dbORM";
import { UsuarioEntity, RolUsuario } from "../database/entities/usuarioEntity";

export async function seedAdmin() {
  const repo = AppDataSource.getRepository(UsuarioEntity);

  const email = (process.env.SEED_ADMIN_EMAIL || "admin@creaciones.local").toLowerCase();
  const pass = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const nombre = process.env.SEED_ADMIN_NOMBRE || "Administrador";

  const exists = await repo.findOne({ where: { email } });
  if (exists) return;

  const hash = await bcrypt.hash(pass, 10);

  const u = repo.create({
    email,
    nombre,                 
    password_hash: hash,
    rol: RolUsuario.ADMIN,
    activo: true,
  });


  await repo.save(u);
  console.log(`✅ Admin creado: ${email} / ${pass}`);
}

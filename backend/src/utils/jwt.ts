// src/utils/jwt.ts
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { RolUsuario } from "../database/entities/usuarioEntity";

export type JwtUserPayload = {
  ID_usuario: number;
  email: string;
  rol: RolUsuario; // 1 | 2 | 3
};

// ✅ Tipos correctos para jsonwebtoken
const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "dev_secret";

// SignOptions["expiresIn"] es (StringValue | number)
// El env viene como string genérico => casteamos para TS
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN ?? "8h") as SignOptions["expiresIn"];

export function signToken(user: JwtUserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtUserPayload {
  return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
}

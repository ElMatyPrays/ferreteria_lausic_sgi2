import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import type { RolUsuario } from "../database/entities/usuarioEntity";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "No autorizado (sin token)" });

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "No autorizado (token inválido)" });
  }
}

export function requireRoles(roles: RolUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "No autorizado" });
    if (!roles.includes(req.user.rol)) return res.status(403).json({ message: "No tienes permisos" });
    next();
  };
}

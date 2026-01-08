// src/services/usuariosApi.ts
import { getToken } from "../utils/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type RolUsuario = "ADMIN" | "OPERADOR" | "LECTOR";
export type RolNum = 1 | 2 | 3;

export type Usuario = {
  ID_usuario: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo?: boolean;
  created_at?: string;
};

export type CreateUsuarioDTO = {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
  activo?: boolean;
};

export type UpdateUsuarioDTO = Partial<{
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  password: string;
}>;

function handleRolToNum(rol: RolUsuario): RolNum {
  if (rol === "ADMIN") return 1;
  if (rol === "OPERADOR") return 2;
  return 3;
}

function handleNumToRol(rol: any): RolUsuario {
  if (rol === "ADMIN" || rol === "OPERADOR" || rol === "LECTOR") return rol;
  const n = Number(rol);
  if (n === 1) return "ADMIN";
  if (n === 2) return "OPERADOR";
  return "LECTOR";
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}


async function handleJson(res: Response) {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) throw new Error((json && (json.error || json.message)) || text || `HTTP ${res.status}`);
  return json;
}

function normalizeUsuario(u: any): Usuario {
  return {
    ID_usuario: Number(u.ID_usuario ?? u.id_usuario),
    nombre: String(u.nombre ?? ""),
    email: String(u.email ?? ""),
    rol: handleNumToRol(u.rol),
    activo: u.activo === true || u.activo === 1 || u.activo === "1",
    created_at: u.created_at,
  };
}

// GET /api/usuarios
export async function getUsuarios(): Promise<Usuario[]> {
  const res = await fetch(`${API}/api/usuarios`, { headers: { ...authHeaders() } });
  const json = await handleJson(res);
  const rows = (Array.isArray(json) ? json : json?.data ?? []) as any[];
  return rows.map(normalizeUsuario);
}

// POST /api/usuarios
export async function createUsuario(dto: CreateUsuarioDTO): Promise<Usuario> {
  const payload = {
    nombre: dto.nombre,
    email: dto.email,
    password: dto.password,
    rol: handleRolToNum(dto.rol),
    activo: dto.activo ?? true,
  };

  const res = await fetch(`${API}/api/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  const json = await handleJson(res);
  return normalizeUsuario(json?.data ?? json);
}

// PUT /api/usuarios/:id
export async function updateUsuario(ID_usuario: number, dto: UpdateUsuarioDTO): Promise<Usuario> {
  const payload: any = { ...dto };

  if (dto.rol) payload.rol = handleRolToNum(dto.rol);
  if (dto.password !== undefined && String(dto.password).trim() === "") delete payload.password;

  const res = await fetch(`${API}/api/usuarios/${ID_usuario}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  const json = await handleJson(res);
  return normalizeUsuario(json?.data ?? json);
}

// DELETE /api/usuarios/:id
export async function deleteUsuario(ID_usuario: number): Promise<void> {
  const res = await fetch(`${API}/api/usuarios/${ID_usuario}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });

  await handleJson(res);
}

// src/utils/auth.ts

// Lo que usa la UI
export type RolUsuario = "ADMIN" | "OPERADOR" | "LECTOR";
export type RolUsuarioBackend = 1 | 2 | 3 | "ADMIN" | "OPERADOR" | "LECTOR";

export type UsuarioAuth = {
  ID_usuario: number;
  nombre: string;
  email: string;
  rol: RolUsuario;     // ✅ en front siempre queda texto
  activo: boolean;     // ✅ mejor boolean (tu backend ya lo maneja así)
};

const TOKEN_KEY = "token";
const USER_KEY = "user";

/** Convierte rol numérico (1/2/3) a string para el front */
export function normalizeRol(rol: any): RolUsuario {
  // si viene como string
  if (rol === "ADMIN" || rol === "OPERADOR" || rol === "LECTOR") return rol;

  // si viene como número o string numérico
  const n = Number(rol);
  if (n === 1) return "ADMIN";
  if (n === 2) return "OPERADOR";
  return "LECTOR";
}

/** Convierte valores raros de activo a boolean */
export function normalizeActivo(activo: any): boolean {
  return activo === true || activo === 1 || activo === "1";
}


/** Normaliza el usuario que viene del backend */
export function normalizeUser(u: any) {
  return {
    ID_usuario: Number(u.ID_usuario),
    nombre: String(u.nombre ?? ""),
    email: String(u.email ?? ""),
    rol: normalizeRol(u.rol),
    activo: normalizeActivo(u.activo),
  };
}

// =========================
// TOKEN
// =========================
export function setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

// =========================
// USER
// =========================
export function setUser(user: any) {
  // ✅ siempre guardamos normalizado
  sessionStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(user)));
}

export function getUser(): UsuarioAuth | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return normalizeUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearUser() {
  sessionStorage.removeItem(USER_KEY);
}

// =========================
// LOGOUT
// =========================
export function logout() {
  sessionStorage.clear();
}

// src/services/authApi.ts
import { getToken, normalizeUser } from "../utils/auth";
import type { UsuarioAuth } from "../utils/auth";

type LoginResponse = { ok: true; token: string; user: UsuarioAuth };

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function handleJson(res: Response) {
  const text = await res.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error((json && (json.error || json.message)) || text || `HTTP ${res.status}`);
  }

  return json;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // ✅ el backend auth espera "password"
    body: JSON.stringify({ email, password }),
  });

  const out = await handleJson(res);
  return { ...out, user: normalizeUser(out.user) };
}

export async function meApi(): Promise<{ ok: true; user: UsuarioAuth }> {
  const token = getToken();
  const res = await fetch(`${API}/api/auth/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const out = await handleJson(res);
  console.log("LOGIN RAW:", out.user);
  console.log("LOGIN NORMALIZED:", normalizeUser(out.user));
  return { ...out, user: normalizeUser(out.user) };
}

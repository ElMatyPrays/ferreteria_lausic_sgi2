import { getToken } from "../utils/auth";

// ✅ Base URL del backend (por .env)
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function resolveUrl(input: RequestInfo | URL): RequestInfo | URL {
  // Si viene un string tipo "/api/ventas" => lo convertimos a "http://localhost:3001/api/ventas"
  if (typeof input === "string") {
    if (input.startsWith("http://") || input.startsWith("https://")) return input;
    if (input.startsWith("/")) return `${API_URL}${input}`;
    return input;
  }

  // URL object
  try {
    const u = input as URL;
    if (u?.protocol) return input;
  } catch {
    // ignore
  }
  return input;
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getToken();

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const resolved = resolveUrl(input);
  return await fetch(resolved, { ...init, headers });
}

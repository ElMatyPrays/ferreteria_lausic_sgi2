import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Error");
  return json.data;
}

export async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Error");
  return json.data;
}

export async function apiPatch<T>(url: string, body: any): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Error");
  return json.data;
}

export async function apiDelete(url: string) {
  const res = await fetch(`${API_URL}${url}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Error");
  return json;
}



// ⬇️ agrega esto al final de src/services/api.ts
export async function apiUpload<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH",
  form: FormData
): Promise<T> {
  const token = getToken?.(); // si en tu api.ts ya importas getToken, usa el mismo
  const res = await fetch(url, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form, // ❗ no poner Content-Type, lo setea el navegador
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.ok === false) {
    const msg =
      json?.error ||
      (Array.isArray(json?.errors) ? json.errors.join(", ") : null) ||
      "Error en la petición";
    throw new Error(msg);
  }

  return (json?.data ?? json) as T;
}

import { getToken } from "../utils/auth";

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getToken();

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers });
  return res;
}

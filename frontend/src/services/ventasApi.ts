// src/services/ventasApi.ts
import { apiFetch } from "./apiFetch";

export type VentaDTO = {
  ID_venta: number;
  total: number;
  fecha: string; // viene como ISO string del backend
  estado: boolean;
};

export type VentaInput = {
  total: number;
  fecha?: string; // opcional (el backend puede poner CURRENT_TIMESTAMP)
  estado: boolean;
};

// NUEVO: crear venta con items (total se calcula en backend)
export type VentaItemInput =
  | { tipo: "producto"; ID_producto: number; cantidad: number }
  | { tipo: "tela"; ID_tela: number; cantidad: number };

export type VentaWithItemsInput = {
  fecha?: string;
  estado?: boolean;
  items: VentaItemInput[];
};

// 🔹 campos válidos para ordenar
export type VentaSortField = "total" | "fecha" | "ID_venta" | "estado";

// 🔹 filtros que usará el front
export interface VentaFilters {
  minTotal?: number;
  maxTotal?: number;
  estado?: boolean;
  fechaDesde?: string; // 'YYYY-MM-DD'
  fechaHasta?: string; // 'YYYY-MM-DD'
  sortBy?: VentaSortField;
  sortDir?: "ASC" | "DESC";
  q?: string; // búsqueda en ID_venta / total
}

const BASE_URL = "/api/ventas";

/* =========================
   READ
   ========================= */
export async function fetchVentas(filters?: VentaFilters): Promise<VentaDTO[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.minTotal != null) params.set("minTotal", String(filters.minTotal));
    if (filters.maxTotal != null) params.set("maxTotal", String(filters.maxTotal));
    if (typeof filters.estado === "boolean") params.set("estado", filters.estado ? "true" : "false");
    if (filters.fechaDesde) params.set("fechaDesde", filters.fechaDesde);
    if (filters.fechaHasta) params.set("fechaHasta", filters.fechaHasta);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortDir) params.set("sortDir", filters.sortDir);
    if (filters.q && filters.q.trim() !== "") params.set("q", filters.q.trim());
  }

  const query = params.toString();
  const url = query ? `${BASE_URL}?${query}` : BASE_URL;

  const res = await apiFetch(url);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.error || "Error al obtener ventas");
  }

  // Soporta ambos formatos: [ {...} ] o { ok, data: [...] }
  if (Array.isArray(json)) return json as VentaDTO[];
  if (json?.ok === false) throw new Error(json?.error || "Error al obtener ventas");
  return (json?.data ?? []) as VentaDTO[];
}

/* =========================
   CREATE
   ========================= */
export async function createVenta(body: VentaInput): Promise<VentaDTO> {
  const res = await apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || "Error al crear venta");
  }

  return (json?.data ?? json) as VentaDTO;
}

/* =========================
   CREATE (con items)
   ========================= */
export async function createVentaWithItems(body: VentaWithItemsInput): Promise<VentaDTO> {
  const res = await apiFetch(`${BASE_URL}/with-items`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.ok === false) {
    // backend manda { ok:false, errors:[...] }
    const msg = Array.isArray(json?.errors)
      ? json.errors.join("\n")
      : (json?.error || "Error al crear venta");
    throw new Error(msg);
  }

  return (json?.data ?? json) as VentaDTO;
}

/* =========================
   UPDATE (con items)
   ========================= */
export async function updateVentaWithItems(
  id: number,
  body: VentaWithItemsInput
): Promise<VentaDTO> {
  const res = await apiFetch(`${BASE_URL}/${id}/with-items`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.ok === false) {
    const msg = Array.isArray(json?.errors)
      ? json.errors.join("\n")
      : (json?.error || "Error al actualizar venta");
    throw new Error(msg);
  }

  return (json?.data ?? json) as VentaDTO;
}

/* =========================
   UPDATE
   ========================= */
export async function updateVenta(id: number, body: VentaInput): Promise<VentaDTO> {
  const res = await apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT", // o PATCH si prefieres
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || "Error al actualizar venta");
  }

  return (json?.data ?? json) as VentaDTO;
}

/* =========================
   DELETE
   ========================= */
export async function deleteVenta(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || "Error al eliminar venta");
  }
}

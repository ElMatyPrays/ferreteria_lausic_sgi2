// src/services/listaVentasApi.ts
import { apiFetch } from "./apiFetch";

export type ListaVentaDTO = {
  ID_lista_venta: number;
  ID_venta: number;
  ID_producto: number;
  ID_tela?: number;
  cantidad: number;
  subtotal: number;
};

export type ListaVentaInput = {
  ID_venta: number;
  ID_producto: number;
  ID_tela?: number;
  cantidad: number;
  subtotal: number;
};

// 🔹 campos válidos para ordenar
export type ListaVentasSortField =
  | "ID_lista_venta"
  | "ID_venta"
  | "cantidad"
  | "subtotal";

// 🔹 filtros que usaremos desde el front
export interface ListaVentasFilters {
  ID_venta?: number;
  minCantidad?: number;
  maxCantidad?: number;
  minSubtotal?: number;
  maxSubtotal?: number;
  sortBy?: ListaVentasSortField;
  sortDir?: "ASC" | "DESC";
  q?: string;
}

function parseListaVentasResponse(json: any): ListaVentaDTO[] {
  if (Array.isArray(json)) return json as ListaVentaDTO[];
  if (json?.ok === false)
    throw new Error(json?.error || "Error al obtener lista_ventas");
  return (json?.data ?? []) as ListaVentaDTO[];
}

/* =========================
   READ (con filtros)
   ========================= */
export async function fetchListaVentas(
  filters?: ListaVentasFilters
): Promise<ListaVentaDTO[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.ID_venta != null && !isNaN(filters.ID_venta)) {
      params.set("ID_venta", String(filters.ID_venta));
    }
    if (filters.minCantidad != null) {
      params.set("minCantidad", String(filters.minCantidad));
    }
    if (filters.maxCantidad != null) {
      params.set("maxCantidad", String(filters.maxCantidad));
    }
    if (filters.minSubtotal != null) {
      params.set("minSubtotal", String(filters.minSubtotal));
    }
    if (filters.maxSubtotal != null) {
      params.set("maxSubtotal", String(filters.maxSubtotal));
    }
    if (filters.sortBy) {
      params.set("sortBy", filters.sortBy);
    }
    if (filters.sortDir) {
      params.set("sortDir", filters.sortDir);
    }
    if (filters.q && filters.q.trim() !== "") {
      params.set("q", filters.q.trim());
    }
  }

  const query = params.toString();
  const url = query ? `/api/lista_ventas?${query}` : "/api/lista_ventas";

  const res = await apiFetch(url);
  const json = await res.json().catch(() => null);

  if (!res.ok) throw new Error(json?.error || "Error al obtener lista_ventas");
  return parseListaVentasResponse(json);
}

/* =========================
   CREATE
   ========================= */
export async function createListaVenta(
  input: ListaVentaInput
): Promise<ListaVentaDTO> {
  const res = await apiFetch("/api/lista_ventas", {
    method: "POST",
    body: JSON.stringify(input),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || "Error al crear lista_venta");
  }
  return (json.data ?? json) as ListaVentaDTO;
}

/* =========================
   UPDATE
   ========================= */
export async function updateListaVenta(
  id: number,
  input: ListaVentaInput
): Promise<ListaVentaDTO> {
  const res = await apiFetch(`/api/lista_ventas/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || "Error al actualizar lista_venta");
  }
  return (json.data ?? json) as ListaVentaDTO;
}

/* =========================
   DELETE
   ========================= */
export async function deleteListaVenta(id: number): Promise<void> {
  const res = await apiFetch(`/api/lista_ventas/${id}`, { method: "DELETE" });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // puede no venir body
  }

  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || "Error al eliminar lista_venta");
  }
}

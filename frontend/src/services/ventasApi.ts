// src/services/ventasApi.ts
import { apiFetch } from "./apiFetch";

/**
 * ✅ Backend real:
 *  - GET    /api/ventas
 *  - POST   /api/ventas
 *  - POST   /api/ventas/con-items
 *  - PUT    /api/ventas/:id
 *  - DELETE /api/ventas/:id
 */

export type VentaDTO = {
  ID_venta: number;
  ID_cliente?: number | null;
  total: number;
  fecha: string; // ISO
  estado_pago: boolean;
  registroVentas?: Array<{
    ID_registro_venta: number;
    ID_producto: number;
    cantidad: number;
    subtotal: number;
  }>;
};


export type VentaInput = {
  ID_cliente?: number | null; 
  total: number;
  fecha?: string;
  estado_pago?: boolean;
};

export type VentaItemInput = {
  ID_producto: number;
  cantidad: number;
  // subtotal opcional: backend lo calcula con precio_venta
  subtotal?: number;
};

export type VentaWithItemsInput = {
  ID_cliente?: number | null;
  fecha?: string;
  estado_pago?: boolean;
  items: VentaItemInput[];
};

export interface VentaFilters {
  q?: string;
  from?: string;
  to?: string;
  estado_pago?: boolean;
  includeItems?: boolean;
}

const BASE_URL = "/api/ventas";

async function readJson(res: Response) {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = json?.message || json?.error || "Error en la petición de ventas";
    throw new Error(msg);
  }

  return json;
}

export async function fetchVentas(filters?: VentaFilters): Promise<VentaDTO[]> {
  const params = new URLSearchParams();

  if (filters?.q?.trim()) params.set("q", filters.q.trim());
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (typeof filters?.estado_pago === "boolean") {
    params.set("estado_pago", filters.estado_pago ? "true" : "false");
  }
  if (filters?.includeItems) params.set("includeItems", "true");

  const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
  const res = await apiFetch(url);
  return (await readJson(res)) as VentaDTO[];
}

export async function createVenta(body: VentaInput): Promise<VentaDTO> {
  const res = await apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return (await readJson(res)) as VentaDTO;
}

export async function createVentaWithItems(body: VentaWithItemsInput): Promise<VentaDTO> {
  const res = await apiFetch(`${BASE_URL}/con-items`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return (await readJson(res)) as VentaDTO;
}

export async function updateVenta(id: number, body: Partial<VentaInput>): Promise<VentaDTO> {
  const res = await apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return (await readJson(res)) as VentaDTO;
}

export async function deleteVenta(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  await readJson(res);
}

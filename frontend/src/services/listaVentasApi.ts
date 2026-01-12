// src/services/listaVentasApi.ts
import { apiFetch } from "./apiFetch";

/**
 * ✅ Backend real:
 *  - GET    /api/registro-venta
 *  - POST   /api/registro-venta
 *  - PUT    /api/registro-venta/:id
 *  - DELETE /api/registro-venta/:id
 */

export type RegistroVentaDTO = {
  ID_registro_venta: number;
  ID_producto: number;
  cantidad: number;
  subtotal: number;
  venta?: { ID_venta: number; total: number; fecha: string; estado_pago: boolean };
  producto?: { ID_producto: number; nombre: string; codigo_barras: string; precio_venta: number };
};

export type RegistroVentaInput = {
  ID_venta: number;
  ID_producto: number;
  cantidad: number;
  subtotal?: number;
};

export interface RegistroVentaFilters {
  ID_venta?: number;
  ID_producto?: number;
  includeProducto?: boolean;
  includeVenta?: boolean;
}

const BASE_URL = "/api/registro-venta";

async function readJson(res: Response) {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.message || json?.error || "Error en la petición de registro_venta";
    throw new Error(msg);
  }
  return json;
}

export async function fetchListaVentas(filters?: RegistroVentaFilters): Promise<RegistroVentaDTO[]> {
  const params = new URLSearchParams();
  if (filters?.ID_venta != null && !Number.isNaN(filters.ID_venta)) params.set("ID_venta", String(filters.ID_venta));
  if (filters?.ID_producto != null && !Number.isNaN(filters.ID_producto)) params.set("ID_producto", String(filters.ID_producto));
  if (filters?.includeProducto) params.set("includeProducto", "true");
  if (filters?.includeVenta) params.set("includeVenta", "true");

  const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
  const res = await apiFetch(url);
  return (await readJson(res)) as RegistroVentaDTO[];
}

export async function createListaVenta(input: RegistroVentaInput): Promise<RegistroVentaDTO> {
  const clean = { ...input };
  delete (clean as any).subtotal;

  const res = await apiFetch(BASE_URL, { method: "POST", body: JSON.stringify(clean) });
  return (await readJson(res)) as RegistroVentaDTO;
}

export async function updateListaVenta(id: number, input: Partial<RegistroVentaInput>): Promise<RegistroVentaDTO> {
  const clean = { ...input };
  delete (clean as any).subtotal;

  const res = await apiFetch(`${BASE_URL}/${id}`, { method: "PUT", body: JSON.stringify(clean) });
  return (await readJson(res)) as RegistroVentaDTO;
}

export async function deleteListaVenta(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  await readJson(res);
}

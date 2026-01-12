// src/services/productosApi.ts
import { apiFetch } from "./apiFetch";

/* =========================
   TIPOS (tabla productos)
   ========================= */
export type ProductoDTO = {
  ID_producto: number;
  SKU: string;
  codigo_barras: string;
  nombre: string;
  tipo: string;
  variante: string;
  marca: string;
  proveedor: string;
  precio_compra: number;
  stock: number;
  precio_venta: number;
};

export type ProductoInput = Omit<ProductoDTO, "ID_producto">;

export type ProductosFilters = {
  q?: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const BASE_URL = `${API_URL}/productos`;

async function readJson(res: Response) {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = json?.message || json?.error || "Error en la petición de productos";
    throw new Error(msg);
  }

  // backend devuelve array u objeto directo
  return json;
}

/* =========================
   READ
   ========================= */
export async function fetchProductos(filters?: ProductosFilters): Promise<ProductoDTO[]> {
  const params = new URLSearchParams();
  if (filters?.q) params.set("q", filters.q);

  const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;

  const res = await apiFetch(url);
  const data = await readJson(res);
  return data as ProductoDTO[];
}

/* =========================
   CREATE
   ========================= */
export async function createProducto(payload: ProductoInput): Promise<ProductoDTO> {
  const res = await apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return (await readJson(res)) as ProductoDTO;
}

/* =========================
   UPDATE
   ========================= */
export async function updateProducto(id: number, payload: ProductoInput): Promise<ProductoDTO> {
  const res = await apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return (await readJson(res)) as ProductoDTO;
}

/* =========================
   DELETE
   ========================= */
export async function deleteProducto(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  await readJson(res);
}

// src/services/productosApi.ts
import { apiFetch } from "./apiFetch";

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
  stock: number; // si en tu bd ahora es decimal, puedes cambiarlo a number igual
  unidad_medida: "mt" | "lt" | "unitario";
  precio_venta: number;
};

export type ProductoInput = Omit<ProductoDTO, "ID_producto">;

// ✅ IMPORTANTE: usar SIEMPRE /api para no pegarle a rutas de React
const BASE_URL = "/api/productos";

async function readJson(res: Response) {
  // Si el backend manda 204, res.json() revienta => lo capturamos
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      (json as any)?.message ||
      (json as any)?.error ||
      "Error en la petición de productos";
    throw new Error(msg);
  }

  return json;
}

export async function fetchProductos(): Promise<ProductoDTO[]> {
  const res = await apiFetch(BASE_URL);
  const data = await readJson(res);

  // ✅ Nunca devolver null/objeto: siempre array
  return Array.isArray(data) ? (data as ProductoDTO[]) : [];
}

export async function createProducto(input: ProductoInput): Promise<ProductoDTO> {
  const res = await apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await readJson(res);
  return data as ProductoDTO;
}

export async function updateProducto(
  ID_producto: number,
  patch: Partial<ProductoInput>
): Promise<ProductoDTO> {
  const res = await apiFetch(`${BASE_URL}/${ID_producto}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  const data = await readJson(res);
  return data as ProductoDTO;
}

export async function deleteProducto(ID_producto: number): Promise<{ ok: true }> {
  const res = await apiFetch(`${BASE_URL}/${ID_producto}`, {
    method: "DELETE",
  });
  const data = await readJson(res);

  // algunos backends devuelven {ok:true}, otros devuelven el objeto borrado
  if (data && typeof data === "object" && "ok" in (data as any)) {
    return data as { ok: true };
  }
  return { ok: true };
}

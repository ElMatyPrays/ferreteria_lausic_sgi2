// src/hooks/useProductos.ts
import { useCallback, useEffect, useState } from "react";
import {
  fetchProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  type ProductoDTO,
  type ProductoInput,
  type ProductosFilters,
} from "../services/productosApi";
import type { Row } from "../components/main/types";

export function useProductos(enabled: boolean, filters?: ProductosFilters) {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const apiData: ProductoDTO[] = await fetchProductos(filters);
      
      const rows: Row[] = apiData.map((p) => {
        // LÓGICA DE FORMATO DE STOCK
        const rawStock = Number(p.stock ?? 0);
        let stockFormateado = "0";

        if (p.unidad_medida === "unitario") {
          // Si es unitario, mostramos entero (ej: 10)
          stockFormateado = String(Math.floor(rawStock));
        } else {
          // Si es mt o lt, mostramos 2 decimales (ej: 10.50)
          stockFormateado = rawStock.toFixed(2);
        }

        return {
          ID_producto: String(p.ID_producto),
          SKU: p.SKU,
          codigo_barras: p.codigo_barras,
          nombre: p.nombre,
          tipo: p.tipo,
          variante: p.variante,
          marca: p.marca,
          proveedor: p.proveedor,
          precio_compra: String(p.precio_compra ?? 0),
          
          stock: stockFormateado, // ✅ Usamos el valor formateado
          unidad_medida: p.unidad_medida, // ✅ Agregamos esto para mostrarlo en la tabla
          
          precio_venta: String(p.precio_venta ?? 0),
        } as unknown as Row; // "as unknown as Row" por si Row no tiene unidad_medida definido aún
      });

      setData(rows);
    } catch (err: any) {
      console.error("Error cargando productos:", err);
      setError(err?.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [enabled, filters]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  const create = useCallback(
    async (payload: ProductoInput) => {
      await createProducto(payload);
      await load();
    },
    [load]
  );

  const update = useCallback(
    async (id: number, payload: ProductoInput) => {
      await updateProducto(id, payload);
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteProducto(id);
      await load();
    },
    [load]
  );

  if (!enabled) {
    return {
      data: [] as Row[],
      loading: false,
      error: null as string | null,
      reload: () => {},
      create: async () => {},
      update: async () => {},
      remove: async () => {},
    };
  }

  return {
    data,
    loading,
    error,
    reload: load,
    create,
    update,
    remove,
  };
}
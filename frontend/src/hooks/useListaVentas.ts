// src/hooks/useListaVentas.ts
import { useCallback, useEffect, useState } from "react";
import type { Row } from "../components/main/types";
import {
  fetchListaVentas,
  createListaVenta,
  updateListaVenta,
  deleteListaVenta,
  type RegistroVentaDTO,        
  type RegistroVentaInput,
} from "../services/listaVentasApi";

export function useListaVentas(enabled: boolean ) {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      const apiData: RegistroVentaDTO[] = await fetchListaVentas();

      const rows: Row[] = apiData.map((rv: any) => ({
        // ✅ keys EXACTAS que usa tu tabla
        ID_registro_venta: String(rv.ID_registro_venta ?? ""),
        ID_venta: String(rv.ID_venta ?? ""),
        ID_producto: String(rv.ID_producto ?? ""),
        cantidad: String(rv.cantidad ?? ""),
        subtotal: String(rv.subtotal ?? ""),
      }));

      setData(rows);
    } catch (err: any) {
      console.error("Error cargando registro_venta:", err);
      setError(err?.message || "Error al cargar registro_venta");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  const create = useCallback(
    async (input: RegistroVentaInput) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        await createListaVenta(input);
        await load();
      } catch (err: any) {
        console.error("Error creando registro_venta:", err);
        setError(err?.message || "Error al crear registro_venta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enabled, load]
  );

  const update = useCallback(
    async (id: number, input: Partial<RegistroVentaInput>) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        await updateListaVenta(id, input as any);
        await load();
      } catch (err: any) {
        console.error("Error actualizando registro_venta:", err);
        setError(err?.message || "Error al actualizar registro_venta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enabled, load]
  );

  const remove = useCallback(
    async (id: number) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        await deleteListaVenta(id);
        await load();
      } catch (err: any) {
        console.error("Error eliminando registro_venta:", err);
        setError(err?.message || "Error al eliminar registro_venta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enabled, load]
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

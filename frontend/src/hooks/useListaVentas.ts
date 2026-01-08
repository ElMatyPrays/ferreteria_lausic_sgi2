// src/hooks/useListaVentas.ts
import { useCallback, useEffect, useState } from "react";
import type { Row } from "../components/main/types";
import {
  fetchListaVentas,
  createListaVenta,
  updateListaVenta,
  deleteListaVenta,
  type ListaVentaDTO,
  type ListaVentaInput,
  type ListaVentasFilters,   // 👈 importar tipo filtros
} from "../services/listaVentasApi";

export function useListaVentas(enabled: boolean, filters?: ListaVentasFilters) {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      const apiData: ListaVentaDTO[] = await fetchListaVentas(filters);
      const rows: Row[] = apiData.map((lv) => ({
        ID_lista_venta: String(lv.ID_lista_venta),
        ID_venta: String((lv as any).venta?.ID_venta ?? ""),
        ID_producto: String((lv as any).ID_producto ?? ""),
        ID_tela: String((lv as any).ID_tela ?? ""),
        cantidad: String(lv.cantidad),
        subtotal: String(lv.subtotal),
      }));
      setData(rows);
    } catch (err: any) {
      console.error("Error cargando lista_ventas:", err);
      setError(err?.message || "Error al cargar lista_ventas");
    } finally {
      setLoading(false);
    }
  }, [enabled, filters]); // 👈 depende de filters

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  const create = useCallback(
    async (input: ListaVentaInput) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        await createListaVenta(input);
        await load();
      } catch (err: any) {
        console.error("Error creando lista_venta:", err);
        setError(err?.message || "Error al crear lista_venta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enabled, load]
  );

  const update = useCallback(
    async (id: number, input: ListaVentaInput) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        await updateListaVenta(id, input);
        await load();
      } catch (err: any) {
        console.error("Error actualizando lista_venta:", err);
        setError(err?.message || "Error al actualizar lista_venta");
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
        console.error("Error eliminando lista_venta:", err);
        setError(err?.message || "Error al eliminar lista_venta");
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

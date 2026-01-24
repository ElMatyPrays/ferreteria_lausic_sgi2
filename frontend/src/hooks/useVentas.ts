// src/hooks/useVentas.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Row } from "../components/main/types";
import {
  fetchVentas,
  createVenta,
  createVentaWithItems,
  updateVenta,
  deleteVenta,
  type VentaDTO,
  type VentaInput,
  type VentaWithItemsInput,
  type VentaFilters,
} from "../services/ventasApi";

export function useVentas(enabled: boolean, filters?: VentaFilters) {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ evita reload infinito si filters viene como objeto nuevo cada render
  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      const apiData: VentaDTO[] = await fetchVentas(filters);

      const rows: Row[] = apiData.map((v) => ({
        ID_venta: String(v.ID_venta),
        ID_cliente: v.ID_cliente ?? "",
        total: String(v.total),
        fecha: v.fecha ? v.fecha.slice(0, 10) : "",
        estado_pago: v.estado_pago ? "true" : "false",
      }));

      setData(rows);
    } catch (err: any) {
      console.error("Error cargando ventas:", err);
      setError(err?.message || "Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }, [enabled, filtersKey]);

  // CREATE
  const create = useCallback(
    async (input: VentaInput) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        await createVenta(input);
        await load();
      } catch (err: any) {
        console.error("Error creando venta:", err);
        setError(err?.message || "Error al crear venta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enabled, load]
  );

  
  // CREATE (with items)
  const createWithItems = useCallback(
    async (input: VentaWithItemsInput) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        const created = await createVentaWithItems(input); // 👈 capturar
        await load();
        return created; // 👈 CLAVE: devolver venta creada
      } catch (err: any) {
        console.error("Error creando venta (items):", err);
        setError(err?.message || "Error al crear venta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enabled, load]
  );


  // ✅ UPDATE: parcial
  const update = useCallback(
    async (id: number, input: Partial<VentaInput>) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        await updateVenta(id, input);
        await load();
      } catch (err: any) {
        console.error("Error actualizando venta:", err);
        setError(err?.message || "Error al actualizar venta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enabled, load]
  );

  // DELETE
  const remove = useCallback(
    async (id: number) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        await deleteVenta(id);
        await load();
      } catch (err: any) {
        console.error("Error eliminando venta:", err);
        setError(err?.message || "Error al eliminar venta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enabled, load]
  );

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  if (!enabled) {
    return {
      data: [] as Row[],
      loading: false,
      error: null as string | null,
      reload: () => {},
      create: async () => {},
      createWithItems: async () => {},
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
    createWithItems,
    update,
    remove,
  };
}

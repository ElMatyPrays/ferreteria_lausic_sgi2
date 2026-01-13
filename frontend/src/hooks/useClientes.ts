// src/hooks/useClientes.ts
import { useCallback, useEffect, useState } from "react";

import {
  fetchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  type ClienteDTO,
  type ClienteInput,
} from "../services/clientesApi";

import type { Row } from "../components/main/types";

export function useClientes(enabled: boolean) { 
  const [data, setData] = useState<Row[]>([]);  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const apiData: ClienteDTO[] = await fetchClientes();
      const rows: Row[] = apiData.map((p) => ({
        ID_cliente: p.ID_cliente,   // ✅ ESTE ES EL FIX
        rut: p.rut,
        razon_social: p.razon_social,
        tipo_de_compra: p.tipo_de_compra,
        giro: p.giro,
        direccion: p.direccion,
        comuna: p.comuna,
        ciudad: p.ciudad,
        contacto: p.contacto,
        tipo_descuento: String(p.tipo_descuento ?? 0),
      }));

      setData(rows);
    } catch (err: any) {
      console.error("Error cargando clientes:", err);
      setError(err?.message || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  const create = useCallback(
    async (payload: ClienteInput) => {
      await createCliente(payload);
      await load();
    },
    [load]
  );

  const update = useCallback(
    async (id: number, payload: ClienteInput) => {
      await updateCliente(id, payload);
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteCliente(id);
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
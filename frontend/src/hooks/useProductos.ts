// src/hooks/useProductos.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductoDTO, ProductoInput } from "../services/productosApi";
import {
  fetchProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../services/productosApi";

type State = {
  items: ProductoDTO[];
  loading: boolean;
  error: string | null;
};

export function useProductos(enabled: boolean = true) {
  const [state, setState] = useState<State>({
    items: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchProductos();

      // ✅ blindaje: siempre array
      const arr = Array.isArray(data) ? data : [];
      setState({ items: arr, loading: false, error: null });
    } catch (e: any) {
      setState({
        items: [],
        loading: false,
        error: e?.message || "Error cargando productos",
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  const add = useCallback(async (input: ProductoInput) => {
    const created = await createProducto(input);
    setState((s) => ({ ...s, items: [created, ...s.items] }));
    return created;
  }, []);

  const edit = useCallback(
    async (ID_producto: number, patch: Partial<ProductoInput>) => {
      const updated = await updateProducto(ID_producto, patch);
      setState((s) => ({
        ...s,
        items: s.items.map((p) => (p.ID_producto === ID_producto ? updated : p)),
      }));
      return updated;
    },
    []
  );

  const remove = useCallback(async (ID_producto: number) => {
    await deleteProducto(ID_producto);
    setState((s) => ({
      ...s,
      items: s.items.filter((p) => p.ID_producto !== ID_producto),
    }));
  }, []);

  const items = useMemo<ProductoDTO[]>(
    () => (Array.isArray(state.items) ? state.items : []),
    [state.items]
  );

  return {
    // ✅ Retrocompatibilidad con tu código actual
    data: items,

    // ✅ Nombre “nuevo” por si lo ocupas en otros componentes
    productos: items,

    loading: state.loading,
    error: state.error,

    // ✅ Retrocompat: si enabled=false y llamas reload() debería cargar igual
    reload: load,

    create: add,
    update: edit,
    remove,
  };
}

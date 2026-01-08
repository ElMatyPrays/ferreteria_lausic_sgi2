// src/hooks/useVentasConItems.ts
import { useState } from "react";

export type VentaItemInput = {
  tipo: "producto" | "tela";
  idProducto: number;
  cantidad: number;
};

export type CreateVentaConItemsInput = {
  fecha?: string;
  estado?: boolean;
  items: VentaItemInput[];
};

export function useVentasConItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVentaConItems = async (input: CreateVentaConItemsInput) => {
    if (!input.items || input.items.length === 0) {
      throw new Error("Debes agregar al menos un producto");
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ventas/con-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const json = await res.json();

      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || "Error al crear venta");
      }

      return json.data;
    } catch (err: any) {
      setError(err.message || "Error inesperado");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createVentaConItems,
    loading,
    error,
  };
}

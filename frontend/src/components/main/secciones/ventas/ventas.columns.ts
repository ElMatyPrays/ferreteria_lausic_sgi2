//src/components/main/secciones/ventas/ventas.columns.ts
import type { Column } from "../../types";

export type VentasSub = "Ventas" | "Lista de ventas";
export const VENTAS_TABS: VentasSub[] = ["Ventas","Lista de ventas"];


export const VENTAS_COLUMNS: Record<VentasSub, Column[]> = {
  Ventas: [
    { key: "ID_venta", header: "ID venta", width: "140px" },
    { key: "total", header: "Total", width: "140px", align: "right" },
    { key: "fecha", header: "Fecha", width: "160px" },
    { key: "estado", header: "Estado Pago", width: "140px" },
  ],
  "Lista de ventas": [
    { key: "ID_lista_venta", header: "ID lista", width: "140px" },
    { key: "ID_venta", header: "ID venta", width: "140px" },
    { key: "ID_producto", header: "ID producto", width: "140px" },
    { key: "ID_tela", header: "ID tela", width: "140px" },
    { key: "cantidad", header: "Cantidad", width: "120px", align: "right", numeric: true },
    { key: "subtotal", header: "Subtotal", width: "140px", align: "right", numeric: true },
  ],
  
};

import type { Row } from "../../types";
import type { VentasSub } from "./ventas.columns";

export const VENTAS_ROWS_DEMO: Record<VentasSub, Row[]> = {
  Ventas: [
    { id_venta: "V-1001", total: "$45.000", fecha: "2025-11-09", estado: "Pagada" },
    { id_venta: "V-1002", total: "$18.000", fecha: "2025-11-10", estado: "Pendiente" },
  ],
  "Lista de ventas": [
    { id_lista_venta: "LV-001", id_souvenir: "SV-001", id_tela: "TL-002", cantidad: "2", subtotal: "$10.000" },
    { id_lista_venta: "LV-002", id_souvenir: "SV-003", id_tela: "—",     cantidad: "1", subtotal: "$8.000" },
  ],
};

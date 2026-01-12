// src/DTO/ventaDTO.ts
export type CreateVentaDTO = {
  total: number;
  fecha?: string | Date;        // opcional (si no viene, DB pone CURRENT_TIMESTAMP)
  estado_pago?: boolean;        // opcional (default false)
};

export type UpdateVentaDTO = Partial<CreateVentaDTO>;

export type VentaQueryDTO = {
  q?: string;                   // filtro simple (por ID o total, etc.)
  from?: string;                // fecha inicio (ISO)
  to?: string;                  // fecha fin (ISO)
  estado_pago?: boolean;
  includeItems?: boolean;       // traer registroVentas
};

// Para crear venta con detalle en una sola llamada
export type CreateVentaConItemsDTO = {
  estado_pago?: boolean;
  fecha?: string | Date;
  items: Array<{
    ID_producto: number;        // puedes mapear desde código de barras en el front/back
    cantidad: number;
    subtotal: number;
  }>;
};

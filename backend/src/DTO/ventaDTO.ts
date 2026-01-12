// src/DTO/ventaDTO.ts
export type CreateVentaDTO = {
  ID_cliente?: number | null;
  total: number;
  fecha?: string;
  estado_pago?: boolean;
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
  ID_cliente?: number | null;
  estado_pago?: boolean;
  fecha?: string | Date;
  items: Array<{
    ID_producto: number;
    cantidad: number;
    subtotal?: number; // ✅ opcional
  }>;
};


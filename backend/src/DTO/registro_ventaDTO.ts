
export type CreateRegistroVentaDTO = {
  ID_venta: number;
  ID_producto: number;
  cantidad: number;
  subtotal: number;
};

export type UpdateRegistroVentaDTO = Partial<Omit<CreateRegistroVentaDTO, "ID_venta">> & {
  // si quieres permitir mover la línea a otra venta, agrega ID_venta opcional
  ID_venta?: number;
};

export type RegistroVentaQueryDTO = {
  ID_venta?: number;
  ID_producto?: number;
  includeProducto?: boolean;
  includeVenta?: boolean;
};

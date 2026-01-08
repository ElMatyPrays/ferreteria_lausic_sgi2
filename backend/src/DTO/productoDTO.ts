export interface CreateProductoDTO {
  SKU: string;
  codigo_barras: string;
  nombre: string;
  tipo: string;
  variante: string;
  marca: string;
  proveedor: string;
  precio_compra: number;
  stock: number;
  precio_venta: number;
}
export type UpdateProductoDTO = Partial<CreateProductoDTO>;

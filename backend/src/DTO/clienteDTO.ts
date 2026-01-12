export interface CreateClienteDTO {
  rut: string;
  razon_social: string;
  tipo_de_compra: string;
  giro: string | number;
  direccion: string;
  comuna: string;
  ciudad: string;
  contacto?: string;
  tipo_descuento?: number;
}

export type UpdateClienteDTO = Partial<CreateClienteDTO>;

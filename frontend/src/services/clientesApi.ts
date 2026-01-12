// src/services/clientesApi.ts
import { apiFetch } from "./apiFetch";

export type ClienteDTO = {
  ID_cliente: number;
  rut: string;
  razon_social: string;
  tipo_de_compra: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  contacto: string;
  tipo_descuento: number;
};

export type ClienteInput = Omit<ClienteDTO, "ID_cliente">;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const BASE_URL = `${API_URL}/api/clientes`;

async function readJson(res: Response) {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = json?.message || json?.error || "Error en la petición de clientes";
    throw new Error(msg);
  }

  // backend devuelve array u objeto directo
  return json;
}

export async function fetchClientes(): Promise<ClienteDTO[]> {
  const res = await apiFetch(BASE_URL);
  const data = await readJson(res);
  return data as ClienteDTO[];
}

export async function createCliente(payload: ClienteInput): Promise<ClienteDTO> {
  const res = await apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return (await readJson(res)) as ClienteDTO;
}

export async function updateCliente(id: number, payload: ClienteInput): Promise<ClienteDTO> {
  const res = await apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return (await readJson(res)) as ClienteDTO;
}

export async function deleteCliente(id: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  await readJson(res);
}
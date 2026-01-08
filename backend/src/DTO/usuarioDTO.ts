import type { RolUsuario } from "../database/entities/usuarioEntity";

export type CreateUsuarioDTO = {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
};

export type UpdateUsuarioDTO = Partial<Omit<CreateUsuarioDTO, "password">> & {
  password?: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

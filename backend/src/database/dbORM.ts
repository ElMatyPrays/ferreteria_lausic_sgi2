// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";

// entidades
import { Registro_ventaEntity } from "./entities/registro_ventaEntity";
import { ProductoEntity} from "./entities/productoEntity";
import { VentaEntity } from "./entities/ventaEntity";
import { UsuarioEntity } from "./entities/usuarioEntity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: "",
  database: "ferreteria_lausic_db",

  synchronize: false,
  logging: false,

  // ESTO ES LA CLAVE
  timezone: "-03:00",
  extra: {
    timezone: "-03:00",
    dateStrings: true,
  },

  entities: [
    Registro_ventaEntity,
    ProductoEntity,
    VentaEntity,
    UsuarioEntity,
  ],
});

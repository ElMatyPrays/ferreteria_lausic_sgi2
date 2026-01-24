// src/database/dbORM.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

// entidades
import { Registro_ventaEntity } from "./entities/registro_ventaEntity";
import { ProductoEntity} from "./entities/productoEntity";
import { VentaEntity } from "./entities/ventaEntity";
import { UsuarioEntity } from "./entities/usuarioEntity";
import { ClienteEntity } from "./entities/clienteEntity";

export const AppDataSource = new DataSource({

  
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

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
    ClienteEntity
  ],
});

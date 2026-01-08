"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
// src/database/dbORM.ts
require("reflect-metadata");
const typeorm_1 = require("typeorm");
// entidades
const registro_ventaEntity_1 = require("./entities/registro_ventaEntity");
const productoEntity_1 = require("./entities/productoEntity");
const ventaEntity_1 = require("./entities/ventaEntity");
const usuarioEntity_1 = require("./entities/usuarioEntity");
exports.AppDataSource = new typeorm_1.DataSource({
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
        registro_ventaEntity_1.Registro_ventaEntity,
        productoEntity_1.ProductoEntity,
        ventaEntity_1.VentaEntity,
        usuarioEntity_1.UsuarioEntity,
    ],
});
//# sourceMappingURL=dbORM.js.map
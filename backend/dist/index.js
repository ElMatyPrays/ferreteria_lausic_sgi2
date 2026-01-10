"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const producto_routes_1 = require("./routes/producto_routes");
const dbORM_1 = require("./database/dbORM");
const seed_admin_1 = require("./seed/seed_admin");
const auth_routes_1 = require("./routes/auth.routes");
const usuarios_routes_1 = require("./routes/usuarios.routes");
const venta_routes_1 = require("./routes/venta_routes");
const registro_venta_routes_1 = require("./routes/registro_venta_routes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = Number(process.env.PORT) || 3001;
dbORM_1.AppDataSource.initialize()
    .then(async () => {
    await (0, seed_admin_1.seedAdmin)();
    console.log("✅ DB conectada");
    // ✅ Rutas
    app.use("/productos", producto_routes_1.productosRouter);
    app.use("/api/auth", auth_routes_1.authRouter);
    app.use("/api/usuarios", usuarios_routes_1.usuariosRouter);
    app.use("/api/ventas", venta_routes_1.ventasRouter);
    app.use("/api/registro-venta", registro_venta_routes_1.registroVentaRouter);
    app.listen(PORT, () => console.log(`✅ http://localhost:${PORT}`));
})
    .catch((err) => console.error("❌ Error DB:", err));
//# sourceMappingURL=index.js.map
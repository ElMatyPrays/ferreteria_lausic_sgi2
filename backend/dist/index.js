"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
require("dotenv/config");
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
const cliente_routes_1 = require("./routes/cliente_routes");
const printer_routes_1 = __importDefault(require("./printer/printer_routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = Number(process.env.PORT) || 3001;
// (Opcional) Agente local de impresión.
// - Por defecto NO se levanta un segundo puerto, para no romper despliegues.
// - Si lo necesitas, define PRINTER_AGENT_PORT (ej: 3333) en tu .env
const PRINTER_AGENT_PORT = process.env.PRINTER_AGENT_PORT
    ? Number(process.env.PRINTER_AGENT_PORT)
    : null;
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
    app.use("/api/clientes", cliente_routes_1.clientesRouter);
    app.use("/api/printer", printer_routes_1.default);
    app.listen(PORT, () => console.log(`✅ http://localhost:${PORT}`));
    // 🖨️ Agente de impresión (opcional)
    // Levanta el mismo API en un puerto local (loopback) para integraciones de impresión.
    // Para activarlo: define PRINTER_AGENT_PORT=3333 en el .env
    if (PRINTER_AGENT_PORT && !Number.isNaN(PRINTER_AGENT_PORT)) {
        app.listen(PRINTER_AGENT_PORT, "127.0.0.1", () => {
            console.log(`🖨️ Agente de impresión activo en http://localhost:${PRINTER_AGENT_PORT}`);
        });
    }
})
    .catch((err) => console.error("❌ Error DB:", err));
//# sourceMappingURL=index.js.map
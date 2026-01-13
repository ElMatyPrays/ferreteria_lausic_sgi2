// src/index.ts
import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import { productosRouter } from "./routes/producto_routes";
import { AppDataSource } from "./database/dbORM";
import { seedAdmin } from "./seed/seed_admin";
import { authRouter } from "./routes/auth.routes";
import { usuariosRouter } from "./routes/usuarios.routes";
import { ventasRouter } from "./routes/venta_routes";
import { registroVentaRouter } from "./routes/registro_venta_routes";
import { clientesRouter } from "./routes/cliente_routes";
import printerRouter from "./printer/printer_routes";




const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3001;

// (Opcional) Agente local de impresión.
// - Por defecto NO se levanta un segundo puerto, para no romper despliegues.
// - Si lo necesitas, define PRINTER_AGENT_PORT (ej: 3333) en tu .env
const PRINTER_AGENT_PORT = process.env.PRINTER_AGENT_PORT
  ? Number(process.env.PRINTER_AGENT_PORT)
  : null;

AppDataSource.initialize()
  .then(async () => {
    await seedAdmin();

    console.log("✅ DB conectada");

    // ✅ Rutas
    app.use("/productos", productosRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/usuarios", usuariosRouter);
    app.use("/api/ventas", ventasRouter);
    app.use("/api/registro-venta", registroVentaRouter);
    app.use("/api/clientes", clientesRouter);
    app.use("/api/printer", printerRouter);
    

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

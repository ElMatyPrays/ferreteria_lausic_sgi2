// src/index.ts
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
  })
  .catch((err) => console.error("❌ Error DB:", err));


  //PA QUE ANDE EL SERVIDOR DE IMPRESION
  const PORTPRINTER = 3333;

  app.listen(PORTPRINTER, "127.0.0.1", () => {
    console.log(`🖨️ Agente de impresión activo en http://localhost:${PORTPRINTER}`);
  });
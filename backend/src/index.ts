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

const app = express();

// Configuración de CORS ultra-compatible
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;

AppDataSource.initialize()
  .then(async () => {
    await seedAdmin();
    console.log("✅ DB conectada");

    // Definimos las rutas con el prefijo /api explícito
    app.use("/api/productos", productosRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/usuarios", usuariosRouter);
    app.use("/api/ventas", ventasRouter);
    app.use("/api/registro-venta", registroVentaRouter);
    app.use("/api/clientes", clientesRouter);

    // Ruta de salud para pruebas manuales
    app.get("/api/health", (req, res) => {
      res.json({ status: "OK", message: "Servidor escuchando en /api" });
    });

    app.listen(PORT, () => console.log(`✅ Servidor en puerto ${PORT}`));
  })
  .catch((err) => console.error("❌ Error DB:", err));
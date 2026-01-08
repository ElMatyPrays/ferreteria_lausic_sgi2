import "reflect-metadata";
import express from "express";
import cors from "cors";
import { productosRouter } from "./routes/producto_routes";
import { AppDataSource } from "./database/dbORM";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3001;

AppDataSource.initialize()
  .then(() => {
    console.log(" DB conectada");
    app.use("/productos", productosRouter);

    app.listen(PORT, () => console.log(` http://localhost:${PORT}`));
  })
  .catch((err) => console.error(" Error DB:", err));

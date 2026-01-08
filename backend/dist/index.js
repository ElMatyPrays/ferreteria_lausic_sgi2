"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const producto_routes_1 = require("./routes/producto_routes");
const dbORM_1 = require("./database/dbORM");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = Number(process.env.PORT) || 3001;
dbORM_1.AppDataSource.initialize()
    .then(() => {
    console.log(" DB conectada");
    app.use("/productos", producto_routes_1.productosRouter);
    app.listen(PORT, () => console.log(` http://localhost:${PORT}`));
})
    .catch((err) => console.error(" Error DB:", err));
//# sourceMappingURL=index.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaEntity = void 0;
const typeorm_1 = require("typeorm");
const registro_ventaEntity_1 = require("./registro_ventaEntity");
const clienteEntity_1 = require("./clienteEntity");
let VentaEntity = class VentaEntity {
};
exports.VentaEntity = VentaEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VentaEntity.prototype, "ID_venta", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "ID_cliente", nullable: true }),
    __metadata("design:type", Number)
], VentaEntity.prototype, "ID_cliente", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "total", nullable: false }),
    __metadata("design:type", Number)
], VentaEntity.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", default: () => "CURRENT_TIMESTAMP", }),
    __metadata("design:type", Date)
], VentaEntity.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint", default: () => "0" }),
    __metadata("design:type", Boolean)
], VentaEntity.prototype, "estado_pago", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => registro_ventaEntity_1.Registro_ventaEntity, (lv) => lv.venta),
    __metadata("design:type", Array)
], VentaEntity.prototype, "registroVentas", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => clienteEntity_1.ClienteEntity, cliente => cliente.ventas, {
        nullable: true, // 🔑 permite null
        onDelete: "SET NULL", // 🔑 si borras cliente, no rompe la venta
    }),
    (0, typeorm_1.JoinColumn)({ name: "ID_cliente" }) // nombre de la FK
    ,
    __metadata("design:type", clienteEntity_1.ClienteEntity)
], VentaEntity.prototype, "cliente", void 0);
exports.VentaEntity = VentaEntity = __decorate([
    (0, typeorm_1.Entity)("venta")
], VentaEntity);
//# sourceMappingURL=ventaEntity.js.map
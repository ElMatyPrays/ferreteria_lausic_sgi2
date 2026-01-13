"use strict";
// src/database/entities/productoEntity.ts
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
exports.ProductoEntity = void 0;
const typeorm_1 = require("typeorm");
const registro_ventaEntity_1 = require("./registro_ventaEntity");
let ProductoEntity = class ProductoEntity {
};
exports.ProductoEntity = ProductoEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductoEntity.prototype, "ID_producto", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255 }),
    __metadata("design:type", String)
], ProductoEntity.prototype, "SKU", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255 }),
    __metadata("design:type", String)
], ProductoEntity.prototype, "codigo_barras", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255 }),
    __metadata("design:type", String)
], ProductoEntity.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255 }),
    __metadata("design:type", String)
], ProductoEntity.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255 }),
    __metadata("design:type", String)
], ProductoEntity.prototype, "variante", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255 }),
    __metadata("design:type", String)
], ProductoEntity.prototype, "marca", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 255 }),
    __metadata("design:type", String)
], ProductoEntity.prototype, "proveedor", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], ProductoEntity.prototype, "precio_compra", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], ProductoEntity.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], ProductoEntity.prototype, "precio_venta", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => registro_ventaEntity_1.Registro_ventaEntity, (lv) => lv.producto),
    __metadata("design:type", Array)
], ProductoEntity.prototype, "registroVenta", void 0);
exports.ProductoEntity = ProductoEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "producto" })
], ProductoEntity);
//# sourceMappingURL=productoEntity.js.map
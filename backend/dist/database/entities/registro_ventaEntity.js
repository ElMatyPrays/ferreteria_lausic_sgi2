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
exports.Registro_ventaEntity = void 0;
// src/database/entities/registro_ventaEntity.ts
const typeorm_1 = require("typeorm");
const productoEntity_1 = require("./productoEntity");
const ventaEntity_1 = require("./ventaEntity");
let Registro_ventaEntity = class Registro_ventaEntity {
};
exports.Registro_ventaEntity = Registro_ventaEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Registro_ventaEntity.prototype, "ID_registro_venta", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], Registro_ventaEntity.prototype, "ID_venta", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], Registro_ventaEntity.prototype, "ID_producto", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], Registro_ventaEntity.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], Registro_ventaEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ventaEntity_1.VentaEntity, (v) => v.registroVentas, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: "ID_venta", referencedColumnName: "ID_venta" }),
    __metadata("design:type", ventaEntity_1.VentaEntity)
], Registro_ventaEntity.prototype, "venta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => productoEntity_1.ProductoEntity, (p) => p.registroVenta, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: "ID_producto", referencedColumnName: "ID_producto" }),
    __metadata("design:type", productoEntity_1.ProductoEntity)
], Registro_ventaEntity.prototype, "producto", void 0);
exports.Registro_ventaEntity = Registro_ventaEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "registro_venta" })
], Registro_ventaEntity);
//# sourceMappingURL=registro_ventaEntity.js.map
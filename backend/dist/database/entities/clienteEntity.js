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
exports.ClienteEntity = void 0;
const typeorm_1 = require("typeorm");
const ventaEntity_1 = require("./ventaEntity");
let ClienteEntity = class ClienteEntity {
};
exports.ClienteEntity = ClienteEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClienteEntity.prototype, "ID_cliente", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "rut", length: 10 }),
    __metadata("design:type", String)
], ClienteEntity.prototype, "rut", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "razon_social", length: 255 }),
    __metadata("design:type", String)
], ClienteEntity.prototype, "razon_social", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "tipo_de_compra", length: 50 }),
    __metadata("design:type", String)
], ClienteEntity.prototype, "tipo_de_compra", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "giro", length: 255 }),
    __metadata("design:type", String)
], ClienteEntity.prototype, "giro", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "direccion", length: 255 }),
    __metadata("design:type", String)
], ClienteEntity.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "comuna", length: 255 }),
    __metadata("design:type", String)
], ClienteEntity.prototype, "comuna", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "ciudad", length: 255 }),
    __metadata("design:type", String)
], ClienteEntity.prototype, "ciudad", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "contacto", length: 255 }),
    __metadata("design:type", String)
], ClienteEntity.prototype, "contacto", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ventaEntity_1.VentaEntity, venta => venta.cliente),
    __metadata("design:type", Array)
], ClienteEntity.prototype, "ventas", void 0);
exports.ClienteEntity = ClienteEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "cliente" })
], ClienteEntity);
//# sourceMappingURL=clienteEntity.js.map
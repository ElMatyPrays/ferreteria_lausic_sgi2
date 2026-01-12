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
exports.UsuarioEntity = exports.RolUsuario = void 0;
const typeorm_1 = require("typeorm");
var RolUsuario;
(function (RolUsuario) {
    RolUsuario[RolUsuario["ADMIN"] = 1] = "ADMIN";
    RolUsuario[RolUsuario["OPERADOR"] = 2] = "OPERADOR";
    RolUsuario[RolUsuario["LECTOR"] = 3] = "LECTOR";
})(RolUsuario || (exports.RolUsuario = RolUsuario = {}));
let UsuarioEntity = class UsuarioEntity {
};
exports.UsuarioEntity = UsuarioEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "ID_usuario" }),
    __metadata("design:type", Number)
], UsuarioEntity.prototype, "ID_usuario", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ name: "email", type: "varchar", length: 255 }),
    __metadata("design:type", String)
], UsuarioEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre", type: "varchar", length: 120, default: "" }),
    __metadata("design:type", String)
], UsuarioEntity.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "passwrd", type: "varchar", length: 255 }),
    __metadata("design:type", String)
], UsuarioEntity.prototype, "password_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "rol", type: "tinyint", default: RolUsuario.LECTOR }),
    __metadata("design:type", Number)
], UsuarioEntity.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "activo", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], UsuarioEntity.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], UsuarioEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], UsuarioEntity.prototype, "updated_at", void 0);
exports.UsuarioEntity = UsuarioEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "usuario" })
], UsuarioEntity);
//# sourceMappingURL=usuarioEntity.js.map
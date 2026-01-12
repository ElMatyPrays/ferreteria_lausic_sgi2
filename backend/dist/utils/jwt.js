"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
// src/utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// ✅ Tipos correctos para jsonwebtoken
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret";
// SignOptions["expiresIn"] es (StringValue | number)
// El env viene como string genérico => casteamos para TS
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "8h");
function signToken(user) {
    return jsonwebtoken_1.default.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
//# sourceMappingURL=jwt.js.map
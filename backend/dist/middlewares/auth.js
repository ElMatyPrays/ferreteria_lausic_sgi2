"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
exports.requireRoles = requireRoles;
const jwt_1 = require("../utils/jwt");
function authRequired(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
        return res.status(401).json({ message: "No autorizado (sin token)" });
    try {
        req.user = (0, jwt_1.verifyToken)(token);
        next();
    }
    catch {
        return res.status(401).json({ message: "No autorizado (token inválido)" });
    }
}
function requireRoles(roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: "No autorizado" });
        if (!roles.includes(req.user.rol))
            return res.status(403).json({ message: "No tienes permisos" });
        next();
    };
}
//# sourceMappingURL=auth.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const printer_controller_1 = require("./printer_controller");
const router = (0, express_1.Router)();
// POST /api/printer/print
router.post("/print", printer_controller_1.printTicket);
exports.default = router;
//# sourceMappingURL=printer_routes.js.map
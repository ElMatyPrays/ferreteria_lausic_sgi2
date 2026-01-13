"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTicket = void 0;
const printer_1 = require("./printer");
const printTicket = async (req, res) => {
    try {
        await (0, printer_1.imprimirTicket)(req.body);
        res.json({ ok: true });
    }
    catch (error) {
        res.status(500).json({ error: "Error al imprimir" });
    }
};
exports.printTicket = printTicket;
//# sourceMappingURL=printer_controller.js.map
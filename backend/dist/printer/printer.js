"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imprimirTicket = imprimirTicket;
const escpos_1 = __importDefault(require("escpos"));
const escpos_usb_1 = __importDefault(require("escpos-usb"));
escpos_1.default.USB = escpos_usb_1.default;
async function imprimirTicket(data) {
    const device = new escpos_1.default.USB(); // detecta impresora USB
    const printer = new escpos_1.default.Printer(device, { encoding: "CP850" });
    device.open(() => {
        printer
            .align("ct")
            .size(2, 2)
            .text("FERRETERÍA LAUSIC")
            .size(1, 1)
            .text("RUT: 12.345.678-9")
            .text("Av. Siempre Viva 123")
            .drawLine()
            .align("lt")
            .text(`Venta N°: ${data.id_venta}`)
            .text(`Fecha: ${data.fecha}`)
            .drawLine();
        data.items.forEach((item) => {
            printer.text(`${item.nombre}\n${item.cantidad} x $${item.precio} = $${item.total}`);
        });
        printer
            .drawLine()
            .align("rt")
            .text(`TOTAL: $${data.total}`)
            .drawLine()
            .align("ct")
            .text("¡Gracias por su compra!")
            .cut()
            .close();
    });
}
//# sourceMappingURL=printer.js.map
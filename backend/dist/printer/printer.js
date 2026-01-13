"use strict";
// backend/src/printer/printer.ts
// Implementación mínima basada en escpos + escpos-usb (ticket térmico por USB).
// OJO: en Windows a veces necesitas drivers/libusb. En Linux puede requerir permisos udev.
Object.defineProperty(exports, "__esModule", { value: true });
exports.imprimirTicket = imprimirTicket;
const escpos = require("escpos");
const USBAdapter = require("@node-escpos/usb-adapter");
escpos.USB = USBAdapter;
const isMock = String(process.env.PRINTER_MOCK || "").toLowerCase() === "true";
async function imprimirTicket(data) {
    return new Promise((resolve, reject) => {
        try {
            if (isMock) {
                console.log("🧾 [MOCK PRINT] Ticket:");
                console.log({
                    id_venta: data.id_venta,
                    fecha: data.fecha,
                    tipo_documento: data.tipo_documento,
                    conIva: data.conIva,
                    resumen: data.resumen,
                    items: data.items,
                    total: data.total,
                });
                resolve(); // ✅ importante
                return;
            }
            console.log("[PRINTER] PRINTER_MOCK =", process.env.PRINTER_MOCK, "=> isMock =", isMock);
            const device = new escpos.USB(); // detecta impresora USB
            const printer = new escpos.Printer(device, { encoding: "CP850" });
            device.open((err) => {
                if (err)
                    return reject(err);
                try {
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
                    (data.items ?? []).forEach((item) => {
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
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
        }
        catch (e) {
            reject(e);
        }
    });
}
//# sourceMappingURL=printer.js.map
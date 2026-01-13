"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTicket = void 0;
const printer_1 = require("./printer");
const ventas_service_1 = require("../services/ventas_service"); // ✅ corregido
const ventasService = new ventas_service_1.VentasService();
/**
 * Body esperado:
 * { id_venta: 123, conIva?: boolean }
 */
const printTicket = async (req, res) => {
    console.log("[PRINTER] request body:", req.body);
    try {
        const { id_venta, conIva } = req.body;
        if (!id_venta)
            return res.status(400).json({ ok: false, error: "id_venta requerido" });
        const { venta, resumen, conIva: conIvaFinal } = await ventasService.getVentaParaImprimir(Number(id_venta), typeof conIva === "boolean" ? conIva : undefined);
        const items = (venta.registroVentas ?? []).map((rv) => {
            const nombre = rv.producto?.nombre ?? `Producto ID ${rv.ID_producto}`;
            const cantidad = Number(rv.cantidad) || 0;
            const subtotal = Number(rv.subtotal) || 0;
            const precio = Number(rv.producto?.precio_venta ?? 0) || (cantidad > 0 ? Math.round(subtotal / cantidad) : 0);
            return { nombre, cantidad, precio, total: subtotal };
        });
        await (0, printer_1.imprimirTicket)({
            id_venta: venta.ID_venta,
            fecha: venta.fecha
                ? new Date(venta.fecha).toLocaleString("es-CL")
                : new Date().toLocaleString("es-CL"),
            total: resumen.total,
            items,
            resumen,
            conIva: conIvaFinal,
            tipo_documento: venta.tipo_documento ?? "boleta",
        });
        res.json({ ok: true, id_venta: venta.ID_venta, resumen, conIva: conIvaFinal });
    }
    catch (error) {
        console.error("❌ Error al imprimir:", error);
        res.status(500).json({ ok: false, error: error?.message ?? "Error al imprimir" });
    }
};
exports.printTicket = printTicket;
//# sourceMappingURL=printer_controller.js.map
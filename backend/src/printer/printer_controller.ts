// backend/src/printer/printer.controller.ts
import type { Request, Response } from "express";
import { imprimirTicket } from "./printer";
import { VentasService } from "../services/ventas_service";

const ventasService = new VentasService();

export const printTicket = async (req: Request, res: Response) => {
  console.log("[PRINTER] request body:", req.body);

  try {
    const { id_venta, conIva } = req.body;

    if (!id_venta) {
      return res.status(400).json({ ok: false, error: "id_venta requerido" });
    }

    const { venta, resumen, conIva: conIvaFinal } = await ventasService.getVentaParaImprimir(
      Number(id_venta),
      typeof conIva === "boolean" ? conIva : undefined
    );

    const items = (venta.registroVentas ?? []).map((rv: any) => {
      const nombre = rv.producto?.nombre ?? `Producto ID ${rv.ID_producto}`;
      const cantidad = Number(rv.cantidad) || 0;
      const subtotal = Number(rv.subtotal) || 0;

      const precio =
        Number(rv.producto?.precio_venta ?? 0) ||
        (cantidad > 0 ? Math.round(subtotal / cantidad) : 0);

      return { nombre, cantidad, precio, total: subtotal };
    });

    // ✅ CLIENTE: va AQUÍ (después de items y antes de imprimirTicket)
    const cliente =
      venta.tipo_documento === "factura" && venta.cliente
        ? {
            rut: String((venta.cliente as any).rut ?? ""),
            razon_social: String((venta.cliente as any).razon_social ?? ""),
            giro: String((venta.cliente as any).giro ?? ""),
            direccion: String((venta.cliente as any).direccion ?? ""),
            comuna: String((venta.cliente as any).comuna ?? ""),
            ciudad: String((venta.cliente as any).ciudad ?? ""),
            contacto: String((venta.cliente as any).contacto ?? ""),
          }
        : undefined;

    await imprimirTicket({
      id_venta: venta.ID_venta,
      fecha: venta.fecha
        ? new Date(venta.fecha).toLocaleString("es-CL")
        : new Date().toLocaleString("es-CL"),
      total: resumen.total,
      items,
      resumen,
      conIva: conIvaFinal,
      tipo_documento: venta.tipo_documento ?? "boleta",
      cliente, // ✅ ESTO hace que printer.ts lo muestre
    } as any);

    return res.json({ ok: true, id_venta: venta.ID_venta, resumen, conIva: conIvaFinal });
  } catch (error: any) {
    console.error("❌ Error al imprimir:", error);
    return res.status(500).json({ ok: false, error: error?.message ?? "Error al imprimir" });
  }
};

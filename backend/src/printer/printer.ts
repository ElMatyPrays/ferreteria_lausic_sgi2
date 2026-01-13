// backend/src/printer/printer.ts
// Implementación mínima basada en escpos + escpos-usb (ticket térmico por USB).
// OJO: en Windows a veces necesitas drivers/libusb.
// En Linux puede requerir permisos udev.

const escpos = require("escpos");
const USBAdapter = require("@node-escpos/usb-adapter");
escpos.USB = USBAdapter;

/* =======================
   TIPOS
======================= */

type TicketItem = {
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
};

type ClienteTicket = {
  rut: string;
  razon_social: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  contacto?: string;
};

type TicketResumen = {
  neto: number;
  iva: number;
  total: number;
};

type TicketData = {
  id_venta: string | number;
  fecha: string;
  items: TicketItem[];
  total: number;
  tipo_documento?: "boleta" | "factura" | string;
  conIva?: boolean;
  resumen?: TicketResumen;
  cliente?: ClienteTicket; // SOLO para factura
};

/* =======================
   CONFIG
======================= */

const isMock = String(process.env.PRINTER_MOCK || "").toLowerCase() === "true";

/* =======================
   PRINT
======================= */

export async function imprimirTicket(data: TicketData): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      /* ========= MOCK ========= */
      if (isMock) {
        console.log("🧾 [MOCK PRINT]");
        console.log(JSON.stringify(data, null, 2));
        resolve();
        return;
      }

      console.log(
        "[PRINTER] PRINTER_MOCK =",
        process.env.PRINTER_MOCK,
        "=> isMock =",
        isMock
      );

      const device = new (escpos as any).USB();
      const printer = new (escpos as any).Printer(device, {
        encoding: "CP850",
      });

      device.open((err: any) => {
        if (err) return reject(err);

        try {
          /* ========= HEADER ========= */
          printer
            .align("ct")
            .size(2, 2)
            .text("FERRETERÍA LAUSIC")
            .size(1, 1)
            .text("RUT: 12.345.678-9")
            .text("Av. Siempre Viva 123")
            .drawLine()
            .align("lt")
            .text(`Documento: ${data.tipo_documento?.toUpperCase() ?? "VENTA"}`)
            .text(`Venta N°: ${data.id_venta}`)
            .text(`Fecha: ${data.fecha}`);

          /* ========= CLIENTE (FACTURA) ========= */
          if (data.tipo_documento === "factura" && data.cliente) {
            printer
              .drawLine()
              .text("DATOS DEL CLIENTE")
              .text(`RUT: ${data.cliente.rut}`)
              .text(`Razón Social: ${data.cliente.razon_social}`)
              .text(`Giro: ${data.cliente.giro}`)
              .text(`Dirección: ${data.cliente.direccion}`)
              .text(
                `${data.cliente.comuna}, 
                ${data.cliente.ciudad}`
              );

            if (data.cliente.contacto) {
              printer.text(`Contacto: ${data.cliente.contacto}`);
            }
          }

          /* ========= ITEMS ========= */
          printer.drawLine();

          (data.items ?? []).forEach((item) => {
            printer.text(
              `${item.nombre}\n${item.cantidad} x $${item.precio} = $${item.total}`
            );
          });

          /* ========= TOTALES ========= */
          printer.drawLine().align("rt");

          if (data.resumen) {
            printer
              .text(`NETO: $${data.resumen.neto}`)
              .text(`IVA: $${data.resumen.iva}`)
              .text(`TOTAL: $${data.resumen.total}`);
          } else {
            printer.text(`TOTAL: $${data.total}`);
          }

          /* ========= FOOTER ========= */
          printer
            .drawLine()
            .align("ct")
            .text("¡Gracias por su compra!")
            .cut()
            .close();

          resolve();
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

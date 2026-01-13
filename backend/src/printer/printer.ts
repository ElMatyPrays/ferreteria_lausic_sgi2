import escpos from "escpos";
import USB from "escpos-usb";

escpos.USB = USB;

export async function imprimirTicket(data: any) {
  const device = new escpos.USB(); // detecta impresora USB
  const printer = new escpos.Printer(device, { encoding: "CP850" });

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

    data.items.forEach((item: any) => {
      printer.text(
        `${item.nombre}\n${item.cantidad} x $${item.precio} = $${item.total}`
      );
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

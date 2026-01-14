// backend/src/printer/printer.ts
// Windows + USB Epson TM-P20 SIN módulos nativos:
// 1) Genera ESC/POS con node-thermal-printer
// 2) Envía RAW al spooler vía "copy /b" a una impresora compartida \\HOST\SHARE

import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";

type TicketItem = { nombre: string; cantidad: number; precio: number; total: number };

type ClienteTicket = {
  rut: string;
  razon_social: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  contacto?: string;
};

type TicketResumen = { neto: number; iva: number; total: number };

type TicketData = {
  id_venta: string | number;
  fecha: string;
  items: TicketItem[];
  total: number;
  tipo_documento?: "boleta" | "factura" | string;
  resumen?: TicketResumen;
  cliente?: ClienteTicket;
};

const isMock = String(process.env.PRINTER_MOCK || "").toLowerCase() === "true";

function width() {
  const w = Number(process.env.PRINTER_WIDTH);
  return Number.isFinite(w) && w > 0 ? w : 32;
}

function money(n: number) {
  const v = Math.round(Number(n) || 0);
  return `$${v.toLocaleString("es-CL")}`;
}

function getSharePath() {
  const host = String(process.env.PRINTER_HOST || "localhost").trim() || "localhost";
  const share = String(process.env.PRINTER_SHARE || "").trim();
  if (!share) throw new Error("Falta PRINTER_SHARE (ej: TMP20). Debes compartir la impresora en Windows.");
  // \\localhost\TMP20
  return `\\\\${host}\\${share}`;
}

function runCopyBinary(srcFile: string, printerSharePath: string) {
  return new Promise<void>((resolve, reject) => {
    // cmd /c copy /b "file" "\\localhost\TMP20"
    const cmd = `copy /b "${srcFile}" "${printerSharePath}"`;
    const child = spawn("cmd.exe", ["/c", cmd], { windowsHide: true });

    let stderr = "";
    child.stderr.on("data", (d) => (stderr += String(d)));

    child.on("exit", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Fallo copy /b (code ${code}). ${stderr || ""}`.trim()));
    });

    child.on("error", reject);
  });
}

export async function imprimirTicket(data: TicketData): Promise<void> {
  if (isMock) {
    console.log("🧾 [MOCK PRINT]");
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const sharePath = getSharePath();

  // node-thermal-printer
  const { printer: ThermalPrinter, types: PrinterTypes, CharacterSet } =
    require("node-thermal-printer");

  const p = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: "dummy", // NO se usa (solo generamos comandos)
    width: width(),
    characterSet: CharacterSet.PC850_MULTILINGUAL,
    removeSpecialCharacters: false,
  });

  // Construye ticket
  p.alignCenter();
  p.setTextDoubleHeight();
  p.setTextDoubleWidth();
  p.println("FERRETERÍA LAUSIC");
  p.setTextNormal();
  p.println("RUT: 12.345.678-9");
  p.println("Av. Siempre Viva 123");
  p.drawLine();

  p.alignLeft();
  p.println(`Documento: ${(data.tipo_documento ?? "VENTA").toUpperCase()}`);
  p.println(`Venta N°: ${data.id_venta}`);
  p.println(`Fecha: ${data.fecha}`);

  if (String(data.tipo_documento).toLowerCase() === "factura" && data.cliente) {
    p.drawLine();
    p.println("DATOS DEL CLIENTE");
    p.println(`RUT: ${data.cliente.rut}`);
    p.println(`Razón Social: ${data.cliente.razon_social}`);
    p.println(`Giro: ${data.cliente.giro}`);
    p.println(`Dirección: ${data.cliente.direccion}`);
    p.println(`${data.cliente.comuna}, ${data.cliente.ciudad}`);
    if (data.cliente.contacto) p.println(`Contacto: ${data.cliente.contacto}`);
  }

  p.drawLine();
  for (const it of data.items ?? []) {
    p.println(it.nombre);
    p.println(`${it.cantidad} x ${money(it.precio)} = ${money(it.total)}`);
  }

  p.drawLine();
  p.alignRight();
  if (data.resumen) {
    p.println(`NETO:  ${money(data.resumen.neto)}`);
    p.println(`IVA:   ${money(data.resumen.iva)}`);
    p.println(`TOTAL: ${money(data.resumen.total)}`);
  } else {
    p.println(`TOTAL: ${money(data.total)}`);
  }

  p.drawLine();
  p.alignCenter();
  p.println("¡Gracias por su compra!");
  p.newLine();
  p.cut();

  // Sacamos el buffer RAW de comandos ESC/POS
  const raw: Buffer = p.getBuffer();

  // Lo escribimos a un archivo temporal y lo mandamos con copy /b
  const tmpFile = path.join(os.tmpdir(), `ticket_${Date.now()}.bin`);
  fs.writeFileSync(tmpFile, raw);

  try {
    await runCopyBinary(tmpFile, sharePath);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

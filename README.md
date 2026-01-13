Cambios en la bdd

ALTER TABLE venta
ADD COLUMN ID_cliente INT NULL AFTER ID_venta;


ALTER TABLE venta
  ADD COLUMN tipo_documento ENUM('boleta','factura') NOT NULL DEFAULT 'boleta';


ALTER TABLE venta ADD COLUMN modo_iva ENUM('incluye_iva','neto') NOT NULL DEFAULT 'incluye_iva';


Para imprimir con maquinita ir a: backend/.env
ahi poner PRINTER_MOCK=false


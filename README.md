cambio en la bdd:

ALTER TABLE venta
  ADD COLUMN tipo_documento ENUM('boleta','factura') NOT NULL DEFAULT 'boleta';

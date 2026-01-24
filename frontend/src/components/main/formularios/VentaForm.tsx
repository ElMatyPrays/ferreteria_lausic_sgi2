// src/components/main/formularios/VentaForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useProductos } from "../../../hooks/useProductos";
import { useClientes } from "../../../hooks/useClientes";
import { useVentas } from "../../../hooks/useVentas";
import Modal from "../../modals/Modal";
import "./VentaForm.css";

type Props = {
  mode?: "create";
  onCancel?: () => void;
  onSuccess?: () => void; // ✅ Esto es lo que usaremos para redirigir
  hideHeader?: boolean;
  autoFocusBarcode?: boolean;
};

type VentaItemUI = {
  id: string; // ID_producto
  cantidad: string;
};

const EMPTY_ITEM: VentaItemUI = { id: "", cantidad: "1" };

export default function VentaForm({
  mode = "create",
  onCancel,
  onSuccess,
  hideHeader,
  autoFocusBarcode = true,
}: Props) {
  const { data: productosRows, loading: productosLoading } = useProductos(true);
  const { data: clientesRows, loading: clientesLoading } = useClientes(true);
  const { createWithItems: createVentaWithItems } = useVentas(true);

  // Estados de notificación y error
  const [notify, setNotify] = useState<string>("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    fecha: string;
    estado_pago: string;
    ID_cliente: string;
    tipo_documento: "boleta" | "factura";
    modo_iva: "incluye_iva" | "neto";
  }>({
    fecha: new Date().toISOString().slice(0, 10),
    estado_pago: "false",
    ID_cliente: "",
    tipo_documento: "boleta",
    modo_iva: "incluye_iva",
  });

  const [items, setItems] = useState<VentaItemUI[]>([{ ...EMPTY_ITEM }]);
  const [barcodes, setBarcodes] = useState<string[]>([""]);

  /* =======================
      LIMITE FACTURA (9 distintos)
  ======================= */
  const MAX_FACTURA_DISTINTOS = 9;
  const isFactura = form.tipo_documento === "factura";

  const distinctCount = useMemo(() => {
    const s = new Set(
      items
        .map((it) => String(it.id || "").trim())
        .filter((id) => id !== "")
    );
    return s.size;
  }, [items]);

  /* =======================
      Effects
  ======================= */
  // asegura longitudes
  useEffect(() => {
    if (barcodes.length !== items.length) {
      setBarcodes((prev) => {
        const next = prev.slice(0, items.length);
        while (next.length < items.length) next.push("");
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // Auto foco barcode
  useEffect(() => {
    if (!autoFocusBarcode) return;
    const idx = Math.max(0, items.length - 1);
    setTimeout(() => {
      const el = document.getElementById(`venta-barcode-${idx}`) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }, [autoFocusBarcode, items.length]);

  /* =======================
      Helpers
  ======================= */
  const round2 = (n: number) => Math.round(n * 100) / 100;

  const money = (n: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(Number(n) || 0);

  const getUnitPrice = (id: string) => {
    const nid = Number(id);
    if (!nid) return 0;
    const row = productosRows.find((r: any) => Number(r.ID_producto) === nid);
    return Number((row as any)?.precio_venta ?? 0) || 0;
  };

  const IVA = 0.19;

  const getSubtotal = (it: VentaItemUI) => {
    const qty = Number(it.cantidad);
    if (!Number.isFinite(qty) || qty <= 0) return 0;

    const base = round2(getUnitPrice(it.id) * qty);
    return form.modo_iva === "neto" ? Math.round(base * (1 + IVA)) : base;
  };

  const total = useMemo(
    () => items.reduce((acc, it) => acc + getSubtotal(it), 0),
    [items, productosRows, form.modo_iva]
  );

  const findProductoByBarcode = (raw: string) => {
    const code = String(raw || "").trim();
    if (!code) return null;

    const found =
      (productosRows as any[]).find((p) => String(p.codigo_barras ?? "").trim() === code) ??
      (productosRows as any[]).find((p) => String(p.SKU ?? "").trim() === code);

    return found ? String((found as any).ID_producto) : null;
  };

  const focusBarcode = (idx: number) => {
    if (!autoFocusBarcode) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(`venta-barcode-${idx}`) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    });
  };

  const applyBarcodeToItem = (idx: number) => {
    const code = String(barcodes[idx] ?? "").trim();
    if (!code) return;

    const foundId = findProductoByBarcode(code);

    // ✅ primero validar si existe
    if (!foundId) {
      setNotify(`Código de barras no encontrado: ${code}`);
      setBarcodes((prev) => prev.map((v, i) => (i === idx ? "" : v)));
      focusBarcode(idx);
      return;
    }

    setItems((prev) => {
      // si ya existe ese producto en otra fila, suma cantidad ahí
      const existingIndex = prev.findIndex((p) => String(p.id) === String(foundId));
      if (existingIndex !== -1) {
        return prev.map((p, i) => {
          if (i !== existingIndex) return p;
          const nextQty = (Number(p.cantidad) || 0) + 1;
          return { ...p, cantidad: String(nextQty) };
        });
      }

      // ✅ si es FACTURA y estamos intentando agregar un producto NUEVO
      if (form.tipo_documento === "factura") {
        const setActual = new Set(
          prev
            .map((it) => String(it.id || "").trim())
            .filter((id) => id !== "")
        );

        // foundId NO existe (porque no estaba arriba)
        if (setActual.size >= MAX_FACTURA_DISTINTOS) {
          setNotify("❌ En Factura solo se permiten 9 productos distintos. Divide la venta en otra factura.");
          return prev; // no cambiar
        }
      }

      // si la fila actual está vacía, úsala
      if (!prev[idx]?.id) {
        return prev.map((p, i) => (i === idx ? { ...p, id: foundId, cantidad: p.cantidad || "1" } : p));
      }

      // si la fila actual ya tiene producto, agrega una fila nueva con este producto
      return [...prev, { id: foundId, cantidad: "1" }];
    });

    setBarcodes((prev) => prev.map((v, i) => (i === idx ? "" : v)));
    focusBarcode(idx);
  };

  // ✅ Construye payload + valida
  const buildPayload = () => {
    if (mode !== "create") throw new Error("Modo inválido");

    // si todos los items están vacíos, no dejar
    const hasAnyProduct = items.some((it) => String(it.id || "").trim() !== "");
    if (!hasAnyProduct) throw new Error("Debes seleccionar al menos 1 producto");

    if (form.tipo_documento === "factura" && !form.ID_cliente) {
      throw new Error("Para Factura debes seleccionar un cliente");
    }

    // ✅ VALIDACIÓN 9 distintos en factura
    if (form.tipo_documento === "factura") {
      const s = new Set(
        items
          .map((it) => String(it.id || "").trim())
          .filter((id) => id !== "")
      );
      if (s.size > MAX_FACTURA_DISTINTOS) {
        throw new Error("Una factura solo puede contener hasta 9 productos distintos.");
      }
    }

    const payloadItems = items
      .filter((it) => String(it.id || "").trim() !== "") // ignora filas vacías
      .map((it, i) => {
        const cantidad = Number(it.cantidad);
        const id = Number(it.id);

        if (!Number.isFinite(cantidad) || cantidad <= 0) throw new Error(`Item #${i + 1}: cantidad inválida`);
        if (!Number.isInteger(id) || id <= 0) throw new Error(`Item #${i + 1}: producto inválido`);

        return { tipo: "producto" as const, ID_producto: id, cantidad };
      });

    return {
      tipo_documento: form.tipo_documento,
      modo_iva: form.modo_iva,
      ID_cliente: form.tipo_documento === "factura" ? Number(form.ID_cliente) : null,
      fecha: form.fecha ? String(form.fecha) : undefined,
      estado_pago: form.estado_pago === "true" || form.estado_pago === "1",
      items: payloadItems,
    };
  };

  const openConfirmModal = () => {
    setNotify("");
    setConfirmError(null);

    try {
      buildPayload(); // solo valida
      setOpenConfirm(true);
    } catch (err: any) {
      setConfirmError(err?.message || "Error en formulario");
      setNotify(err?.message || "Error en formulario");
    }
  };

  // 🔴 AQUÍ ESTÁ EL CAMBIO IMPORTANTE
  const handleConfirmCreate = async () => {
    setSaving(true);
    setConfirmError(null);
    setNotify("");

    try {
      const payload = buildPayload();

      // Creamos la venta
      await createVentaWithItems(payload);

      // Cerramos el modal de confirmación
      setOpenConfirm(false);

      // ✅ Redirigimos INMEDIATAMENTE al home (o donde indique onSuccess)
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setConfirmError(err?.message || "Error al crear venta");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Resumen para el modal
  const resumen = useMemo(() => {
    const documento = form.tipo_documento === "factura" ? "Factura" : "Boleta";
    const estado = form.estado_pago === "true" || form.estado_pago === "1" ? "Pagada" : "Pendiente";

    const clienteData =
      form.tipo_documento === "factura"
        ? clientesRows.find((x: any) => String(x.ID_cliente) === String(form.ID_cliente)) || null
        : null;

    const itemsResumen = items
      .filter((it) => String(it.id || "").trim() !== "")
      .map((it, idx) => {
        const prod = productosRows.find((p: any) => String(p.ID_producto) === String(it.id));
        const nombre = prod ? String(prod.nombre) : it.id ? `Producto ID ${it.id}` : `Item ${idx + 1}`;
        const precio = getUnitPrice(it.id);
        const subtotal = getSubtotal(it);

        return { nombre, cantidad: it.cantidad, precio, subtotal };
      });

    return { documento, fecha: form.fecha, estado, clienteData, items: itemsResumen, total };
  }, [form, items, total, clientesRows, productosRows]);

  return (
    <div className="venta-form-root md-card md-card-lg md-inline">
      {!hideHeader && (
        <div className="md-header">
          <h3 className="md-title">Crear venta</h3>
        </div>
      )}

      <div className="md-body">
        {notify && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--mc-grid)",
              opacity: 0.95,
            }}
          >
            {notify}
          </div>
        )}

        <div className="venta-modal">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Fecha</span>
              <input
                className="md-input"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Estado</span>
              <select
                className="md-input"
                value={form.estado_pago}
                onChange={(e) => setForm((p) => ({ ...p, estado_pago: e.target.value }))}
              >
                <option value="false">Pendiente</option>
                <option value="true">Pagada</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Documento</span>
              <select
                className="md-input"
                value={form.tipo_documento}
                onChange={(e) => {
                  const v = e.target.value as "boleta" | "factura";
                  setForm((p) => ({
                    ...p,
                    tipo_documento: v,
                    ID_cliente: v === "boleta" ? "" : p.ID_cliente,
                  }));
                }}
              >
                <option value="boleta">Boleta</option>
                <option value="factura">Factura</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>IVA</span>
              <select
                className="md-input"
                value={form.modo_iva}
                onChange={(e) => setForm((p) => ({ ...p, modo_iva: e.target.value as any }))}
              >
                <option value="incluye_iva">No afecta</option>
                <option value="neto">Afecta</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Cliente</span>
              <select
                className="md-input"
                value={form.ID_cliente}
                onChange={(e) => setForm((p) => ({ ...p, ID_cliente: e.target.value }))}
                disabled={clientesLoading || form.tipo_documento === "boleta"}
              >
                <option value="">
                  {clientesLoading
                    ? "Cargando..."
                    : form.tipo_documento === "boleta"
                    ? "-- Sin cliente (Boleta) --"
                    : "-- Selecciona cliente (Factura) --"}
                </option>

                {clientesRows.map((c: any) => (
                  <option key={String(c.ID_cliente)} value={String(c.ID_cliente)}>
                    {String(c.razon_social)} ({String(c.rut)})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="venta-items">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <strong>Items vendidos</strong>
                {isFactura && (
                  <span style={{ fontSize: 12, opacity: 0.75 }}>
                    Productos distintos: {distinctCount}/{MAX_FACTURA_DISTINTOS}
                  </span>
                )}
              </div>

              <button
                className="md-btn"
                type="button"
                disabled={isFactura && distinctCount >= MAX_FACTURA_DISTINTOS}
                title={
                  isFactura && distinctCount >= MAX_FACTURA_DISTINTOS
                    ? "En Factura solo se permiten 9 productos distintos"
                    : "Agregar item"
                }
                onClick={() => {
                  if (isFactura && distinctCount >= MAX_FACTURA_DISTINTOS) {
                    setNotify("❌ En Factura solo se permiten 9 productos distintos.");
                    return;
                  }
                  setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
                  setBarcodes((prev) => [...prev, ""]);
                }}
              >
                + Agregar item
              </button>
            </div>

            <div className="venta-items-scroll">
              <div className="venta-items-grid">
                {items.map((it, idx) => {
                  const precio = getUnitPrice(it.id);
                  const subtotal = getSubtotal(it);

                  return (
                    <div key={idx} className="venta-item-row">
                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontSize: 12, opacity: 0.85 }}>Producto</span>
                        <select
                          className="md-input"
                          value={it.id}
                          onChange={(e) => {
                            const nextId = e.target.value;

                            setItems((prev) => {
                              const prevId = String(prev[idx]?.id || "").trim();

                              if (!nextId) {
                                return prev.map((p, i) => (i === idx ? { ...p, id: "" } : p));
                              }

                              if (form.tipo_documento !== "factura") {
                                return prev.map((p, i) => (i === idx ? { ...p, id: nextId } : p));
                              }

                              const setActual = new Set(
                                prev
                                  .map((x) => String(x.id || "").trim())
                                  .filter((id) => id !== "")
                              );

                              if (prevId) setActual.delete(prevId);
                              setActual.add(String(nextId));

                              if (setActual.size > MAX_FACTURA_DISTINTOS) {
                                setNotify("❌ En Factura solo se permiten 9 productos distintos.");
                                return prev;
                              }

                              return prev.map((p, i) => (i === idx ? { ...p, id: nextId } : p));
                            });
                          }}
                          disabled={productosLoading}
                        >
                          <option value="">{productosLoading ? "Cargando..." : "-- Selecciona --"}</option>
                          {productosRows.map((r: any) => (
                            <option key={String(r.ID_producto)} value={String(r.ID_producto)}>
                              {String(r.nombre)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontSize: 12, opacity: 0.85 }}>Código barras</span>
                        <input
                          className="md-input"
                          id={`venta-barcode-${idx}`}
                          inputMode="numeric"
                          placeholder="Escanea y presiona Enter"
                          value={barcodes[idx] ?? ""}
                          onChange={(e) =>
                            setBarcodes((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              applyBarcodeToItem(idx);
                            }
                          }}
                        />
                      </label>

                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontSize: 12, opacity: 0.85 }}>Cantidad</span>
                        <input
                          className="md-input"
                          id={`venta-cant-${idx}`}
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={it.cantidad}
                          onChange={(e) =>
                            setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, cantidad: e.target.value } : p)))
                          }
                        />
                      </label>

                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontSize: 12, opacity: 0.85 }}>Precio</span>
                        <input className="md-input" value={money(precio)} readOnly />
                      </label>

                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontSize: 12, opacity: 0.85 }}>Subtotal</span>
                        <input className="md-input" value={money(subtotal)} readOnly />
                      </label>

                      <button
                        className="md-btn danger"
                        type="button"
                        onClick={() => {
                          if (items.length === 1) return;
                          setItems((prev) => prev.filter((_, i) => i !== idx));
                          setBarcodes((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        title="Eliminar item"
                        disabled={items.length === 1}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="venta-total">
            <div className="venta-total-box">
              <span style={{ fontSize: 12, opacity: 0.85 }}>Total (calculado)</span>
              <input className="md-input" value={money(total)} readOnly />
            </div>
          </div>
        </div>
      </div>

      <div className="md-footer">
        {onCancel && (
          <button className="md-btn" type="button" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        )}
        <button className="md-btn primary" type="button" onClick={openConfirmModal} disabled={saving}>
          Guardar
        </button>
      </div>

      <Modal
        open={openConfirm}
        title="Resumen de la venta"
        onClose={() => {
          if (saving) return;
          setConfirmError(null);
          setOpenConfirm(false);
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%", overflow: "hidden" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><b>Doc:</b> {resumen.documento}</div>
            <div><b>Fecha:</b> {resumen.fecha}</div>
            <div><b>Estado:</b> {resumen.estado}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,.05)", padding: 10, borderRadius: 8 }}>
            <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 6, textTransform: "uppercase", opacity: 0.7 }}>
              Datos del Cliente
            </div>
            {resumen.clienteData ? (
              <div style={{ display: "grid", gap: 4, fontSize: 13 }}>
                <div><b>Razón Social:</b> {resumen.clienteData.razon_social}</div>
                <div><b>RUT:</b> {resumen.clienteData.rut}</div>
                <div><b>Giro:</b> {resumen.clienteData.giro || "-"}</div>
                <div><b>Dirección:</b> {resumen.clienteData.direccion || "-"}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span><b>Ciudad:</b> {resumen.clienteData.ciudad || "-"}</span>
                  <span><b>Comuna:</b> {resumen.clienteData.comuna || "-"}</span>
                </div>
                <div><b>Contacto:</b> {resumen.clienteData.contacto || "-"}</div>
                <div><b>Tipo Compra:</b> {resumen.clienteData.tipo_de_compra || "-"}</div>
              </div>
            ) : (
              <div style={{ fontSize: 13, opacity: 0.6 }}>Sin cliente seleccionado (Boleta)</div>
            )}
          </div>

          <div style={{ 
            borderTop: "1px solid rgba(255,255,255,.08)", 
            paddingTop: 10, 
            display: "flex", 
            flexDirection: "column", 
            flex: 1, 
            minHeight: 0 
          }}>
            <b>Items</b>

            <div style={{ 
              display: "grid", 
              gap: 8, 
              marginTop: 10, 
              overflowY: "auto", 
              flex: 1, 
              paddingRight: 4,
              // 👇 ESTO ES LO NUEVO:
              alignContent: "start", // Fuerza a los items a irse hacia arriba
              gridAutoRows: "max-content" // Asegura que cada fila tenga la altura de su contenido
            }}>
              {resumen.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 10,
                    alignItems: "center",
                    padding: 10,
                    borderRadius: 10,
                    background: "rgba(255,255,255,.04)",
                    minHeight: "50px" // 👇 Opcional: Altura mínima para que se vean uniformes
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{it.nombre}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Cantidad: {it.cantidad}</div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.85 }}>Precio: {money(it.precio)}</div>

                  <div style={{ fontWeight: 800 }}>{money(it.subtotal)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, fontSize: 16 }}>
              <b>Total:</b>&nbsp;{money(resumen.total)}
            </div>
          </div>

          {confirmError && <div style={{ color: "#ff6b6b", fontSize: 13 }}>{confirmError}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              className="md-btn"
              type="button"
              onClick={() => {
                setConfirmError(null);
                setOpenConfirm(false);
              }}
              disabled={saving}
            >
              Volver
            </button>

            <button className="md-btn primary" type="button" onClick={handleConfirmCreate} disabled={saving}>
              {saving ? "Creando..." : "Confirmar y crear"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Se eliminó el Modal de "Venta Creada" */}
    </div>
  );
}
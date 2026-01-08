// src/components/main/maincontent.tsx
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getUser } from "../../utils/auth";
import Modal from "../modals/Modal";
import type { Column, Row, Section } from "../main/types";

import VentasTabs from "../main/secciones/ventas/VentasTabs";
import type { VentasSub } from "../main/secciones/ventas/ventas.columns";
import { VENTAS_COLUMNS } from "../main/secciones/ventas/ventas.columns";
import { VENTAS_ROWS_DEMO } from "../main/secciones/ventas/ventas.rows.demo";

import FormDinamico from "../main/formularios/formDinamico";
import DataTable from "./tablas/DatosTablas";
import "./maincontent.css";

import { useProductos } from "../../hooks/useProductos";
import { useVentas } from "../../hooks/useVentas";
import { useListaVentas } from "../../hooks/useListaVentas";

import { getStockClass } from "../../utils/stockColor";
import { useStockConfig, type StockSectionKey } from "../../hooks/useStockConfig";
import StockColorConfigModal from "../modals/StockColorConfigModal";

import { fetchListaVentas, type ListaVentaDTO } from "../../services/listaVentasApi";

import { FiSettings, FiRefreshCw, FiPlus } from "react-icons/fi";



/* =========================
   Columnas base (sin tabs)
   ========================= */
const columnsBySection: Record<Section, Column[]> = {
  Productos: [
    { key: "ID_producto", header: "ID", width: "90px" },
    { key: "SKU", header: "SKU", width: "140px" },
    { key: "codigo_barras", header: "Código de barras", width: "200px" },
    { key: "nombre", header: "Nombre" },
    { key: "tipo", header: "Tipo", width: "160px" },
    { key: "variante", header: "Variante", width: "160px" },
    { key: "marca", header: "Marca", width: "160px" },
    { key: "proveedor", header: "Proveedor", width: "160px" },
    { key: "precio_compra", header: "Precio compra", width: "140px", align: "right", numeric: true },
    { key: "stock", header: "Stock", width: "100px", align: "right", numeric: true },
    { key: "precio_venta", header: "Precio venta", width: "140px", align: "right", numeric: true },
  ],
  Ventas: [],
};

/* =========================
   Filas demo (fallback)
   ========================= */
const demoRowsBySection: Record<Section, Row[]> = {
  Productos: [
    { codigo: "SV-001", nombre: "Taza personalizada", stock: "Alto", estado: "Activo" },
    { codigo: "SV-002", nombre: "Llavero acrílico", stock: "Bajo", estado: "Reponer" },
    { codigo: "SV-003", nombre: "Imán ref.", stock: "Sin stock", estado: "En pedido" },
  ],
  Ventas: [],
};

type ResourceKey =
  | "productos"
  | "ventas"
  | "lista_ventas"
  | "demo";

interface CrudConfig {
  key: ResourceKey;
  enabled: boolean;
  idKey?: string;
  rows: Row[];
  loading: boolean;
  error: string | null;
  reload?: () => void;
  buildEmptyForm?: (columns: Column[]) => Row;
  buildCreatePayload?: (form: Row) => any;
  buildUpdatePayload?: (form: Row, row: Row) => any;
  create?: (payload: any) => Promise<any>;
  update?: (id: number, payload: any) => Promise<any>;
  remove?: (id: number) => Promise<any>;
}

function ErrorBanner({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div
      style={{
        margin: "8px 16px 0",
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #ef4444",
        color: "#ef4444",
      }}
    >
      {msg}
    </div>
  );
}

interface MainContentProps {
  section: Section;

  venTab?: VentasSub;
  onVenTabChange?: (t: VentasSub) => void;
}

type ModalKind = "none" | "create" | "edit" | "confirm" | "notify";

export default function MainContent({
  section,
  venTab: venTabProp,
  onVenTabChange,
}: MainContentProps) {
  const user = getUser();
  const role = user?.rol ?? "LECTOR";
  console.log("ROLE:", role, "USER:", user);


  const isAdmin = role === "ADMIN";
  const isOperador = role === "OPERADOR";
  const isReader = role === "LECTOR";

  // Si quieres: permisos por acción
  const canWrite = isAdmin || isOperador; // crear/editar
  const canDelete = isAdmin;              // eliminar solo admin (recomendado)


  const [venTabState, setVenTabState] = useState<VentasSub>("Ventas");
  const venTab = venTabProp ?? venTabState;
  const setVenTab = onVenTabChange ?? setVenTabState;

  const columns = useMemo<Column[]>(() => {
    if (section === "Ventas") return VENTAS_COLUMNS[venTab];
    return columnsBySection[section];
  }, [section, venTab]);

  const [baseRows, setBaseRows] = useState<Row[]>([]);
  useEffect(() => {
    if (section === "Ventas") setBaseRows(VENTAS_ROWS_DEMO[venTab] ?? []);
    else setBaseRows(demoRowsBySection[section] ?? []);
  }, [section, venTab]);

  // Productos (también para Lista de ventas y Ventas)
  const productosEnabled =
    section === "Productos" ||
    (section === "Ventas" && (venTab === "Lista de ventas" || venTab === "Ventas"));

  const {
    data: productosRows,
    loading: productosLoading,
    error: productosError,
    reload: reloadProductos,
    create: createProducto,
    update: updateProducto,
    remove: removeProducto,
  } = useProductos(productosEnabled);

  // Ventas
  const ventasEnabled = section === "Ventas" && (venTab === "Ventas" || venTab === "Lista de ventas");

  const {
    data: ventasRows,
    loading: ventasLoading,
    error: ventasError,
    reload: reloadVentas,
    create: createVenta,
    createWithItems: createVentaWithItems,
    updateWithItems: updateVentaWithItems,
    update: updateVenta,
    remove: removeVenta,
  } = useVentas(ventasEnabled);

  // Lista ventas
  const listaVentasEnabled = section === "Ventas" && venTab === "Lista de ventas";
  const {
    data: listaVentasRows,
    loading: listaVentasLoading,
    error: listaVentasError,
    reload: reloadListaVentas,
    remove: removeListaVenta,
  } = useListaVentas(listaVentasEnabled);

  const productosConfig: CrudConfig = {
    key: "productos",
    enabled: productosEnabled,
    idKey: "ID_producto",
    rows: productosRows,
    loading: productosLoading,
    error: productosError,
    reload: reloadProductos,
    buildEmptyForm: (cols) => {
      const empty: Row = {};
      cols.forEach((c) => (empty[c.key] = ""));
      empty.precio_compra = 0;
      empty.stock = 0;
      empty.precio_venta = 0;
      return empty;
    },
    buildCreatePayload: (form) => ({
      SKU: String(form.SKU || ""),
      codigo_barras: String(form.codigo_barras || ""),
      nombre: String(form.nombre || ""),
      tipo: String(form.tipo || ""),
      variante: String(form.variante || ""),
      marca: String(form.marca || ""),
      proveedor: String(form.proveedor || ""),
      precio_compra: Number(form.precio_compra || 0),
      stock: Number(form.stock || 0),
      precio_venta: Number(form.precio_venta || 0),
    }),
    buildUpdatePayload: (form) => ({
      SKU: String(form.SKU || ""),
      codigo_barras: String(form.codigo_barras || ""),
      nombre: String(form.nombre || ""),
      tipo: String(form.tipo || ""),
      variante: String(form.variante || ""),
      marca: String(form.marca || ""),
      proveedor: String(form.proveedor || ""),
      precio_compra: Number(form.precio_compra || 0),
      stock: Number(form.stock || 0),
      precio_venta: Number(form.precio_venta || 0),
    }),
    create: createProducto,
    update: updateProducto,
    remove: removeProducto,
  };

  const ventasConfig: CrudConfig = {
    key: "ventas",
    enabled: ventasEnabled,
    idKey: "ID_venta",
    rows: ventasRows,
    loading: ventasLoading,
    error: ventasError,
    reload: reloadVentas,
    buildEmptyForm: (cols) => {
      const empty: Row = {};
      cols.forEach((c) => (empty[c.key] = ""));
      empty.total = 0;
      empty.fecha = new Date().toISOString().slice(0, 10);
      empty.estado = "false";
      return empty;
    },
    buildCreatePayload: (form) => ({
      total: Number(form.total || 0),
      fecha: form.fecha ? String(form.fecha) : undefined,
      estado: form.estado === true || form.estado === "true" || form.estado === "1",
    }),
    buildUpdatePayload: (form, row) => ({
      total: Number(form.total ?? row.total ?? 0),
      fecha: form.fecha ? String(form.fecha) : String(row.fecha || ""),
      estado:
        form.estado === true ||
        form.estado === "true" ||
        form.estado === "1" ||
        row.estado === true ||
        row.estado === "true" ||
        row.estado === "1",
    }),
    create: createVenta,
    update: updateVenta,
    remove: removeVenta,
  };

  const listaVentasConfig: CrudConfig = {
    key: "lista_ventas",
    enabled: listaVentasEnabled,
    idKey: "ID_lista_venta",
    rows: listaVentasRows,
    loading: listaVentasLoading,
    error: listaVentasError,
    reload: reloadListaVentas,
    buildEmptyForm: (cols) => {
      const empty: Row = {};
      cols.forEach((c) => (empty[c.key] = ""));
      empty.ID_venta = "";
      empty.ID_producto = "";
      empty.cantidad = 0;
      empty.subtotal = 0;
      return empty;
    },
    buildCreatePayload: (form) => {
      const payload = {
        ID_venta: Number(form.ID_venta),
        ID_producto: form.ID_producto === "" || form.ID_producto == null ? null : Number(form.ID_producto),
        cantidad: Number(form.cantidad),
        subtotal: Number(form.subtotal),
      };

      if (!payload.ID_venta) throw new Error("Debes ingresar un ID_venta válido.");
      const hasProducto = Number.isInteger(payload.ID_producto as any) && (payload.ID_producto as any) > 0;
      if (!hasProducto) throw new Error("Debes seleccionar un producto.");
      if (!payload.cantidad || payload.cantidad <= 0) throw new Error("La cantidad debe ser mayor que 0.");
      if (!payload.subtotal || payload.subtotal <= 0) throw new Error("El subtotal debe ser mayor que 0.");

      return payload;
    },
    buildUpdatePayload: (form) => ({
      ID_venta: Number(form.ID_venta || 0),
      ID_producto: Number(form.ID_producto || 0),
      cantidad: Number(form.cantidad || 0),
      subtotal: Number(form.subtotal || 0),
    }),
    remove: removeListaVenta,
  };

  const demoEnabled = !productosEnabled && !ventasEnabled && !listaVentasEnabled;

  const demoConfig: CrudConfig = {
    key: "demo",
    enabled: demoEnabled,
    rows: baseRows,
    loading: false,
    error: null,
  };

  const configs: CrudConfig[] = [productosConfig, ventasConfig, listaVentasConfig, demoConfig];

  let active: CrudConfig;
  if (section === "Ventas") {
    if (venTab === "Ventas") active = ventasConfig;
    else if (venTab === "Lista de ventas") active = listaVentasConfig;
    else active = demoConfig;
  } else {
    active = configs.find((c) => c.enabled) ?? demoConfig;
  }

  const { config: stockCfg, setSection: setStockSection, resetSection: resetStockSection, labels: stockLabels } =
    useStockConfig();

  const [stockCfgOpen, setStockCfgOpen] = useState(false);

  const stockSectionKey: StockSectionKey | null =
    active.key === "productos" ? ("productos" as StockSectionKey) : null;

  const getCellClassName = (col: Column, row: Row) => {
    if (active.key === "productos" && col.key === "stock") {
      const valor = Number(row.stock ?? 0);
      return getStockClass(valor, stockCfg.productos);
    }
    return "";
  };

  const displayRows: Row[] = active.rows;
  const idKey = useMemo(() => active.idKey ?? columns[0]?.key, [active.idKey, columns]);

  const readOnlyKeysCreate: string[] = [];
  const readOnlyKeysEdit: string[] = [];
  if (idKey) readOnlyKeysEdit.push(idKey);

  const isReadOnly = false;

  const [modal, setModal] = useState<ModalKind>("none");
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Row>({});
  const [notifyMsg, setNotifyMsg] = useState<string>("");
  

  // =========================
  // Ventas: SOLO productos
  // =========================
  type VentaItemUI = {
    tipo: "producto";
    id: string; // ID_producto
    cantidad: string; // permite decimales
  };
  const [ventaItems, setVentaItems] = useState<VentaItemUI[]>([]);
  const round2 = (n: number) => Math.round(n * 100) / 100;

  const getUnitPrice = (id: string) => {
    const nid = Number(id);
    if (!nid) return 0;
    const row = productosRows.find((r) => Number((r as any).ID_producto) === nid);
    return row ? Number((row as any).precio_venta) || 0 : 0;
  };

  const getSubtotal = (it: VentaItemUI) => {
    const qty = Number(it.cantidad);
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    const price = getUnitPrice(it.id);
    return round2(qty * price);
  };

  const ventaTotal = useMemo(() => round2(ventaItems.reduce((acc, it) => acc + getSubtotal(it), 0)), [
    ventaItems,
    productosRows,
  ]);

  const closeModal = () => setModal("none");

  const openCreate = () => {
    if (active.key === "ventas") {
      setVentaItems([{ tipo: "producto", id: "", cantidad: "1" }]);
      setFormData({
        fecha: new Date().toISOString().slice(0, 10),
        estado: "false",
      });
      setModal("create");
      return;
    }

    const empty =
      active.buildEmptyForm?.(columns) ??
      (() => {
        const obj: Row = {};
        columns.forEach((c) => (obj[c.key] = ""));
        return obj;
      })();

    setFormData(empty);
    setModal("create");
  };

  const openEdit = async (idx: number) => {
    const row = active.rows[idx];
    setCurrentIndex(idx);

    if (active.key === "ventas") {
      try {
        const idVenta = Number((row as any).ID_venta);
        if (!Number.isInteger(idVenta) || idVenta <= 0) throw new Error("ID_venta inválido");

        const items: ListaVentaDTO[] = await fetchListaVentas({ ID_venta: idVenta });

        const mapped: VentaItemUI[] = items
          .filter((it) => Number((it as any).ID_producto) && Number((it as any).ID_producto) > 0)
          .map((it) => ({
            tipo: "producto",
            id: String((it as any).ID_producto),
            cantidad: String(it.cantidad ?? 1),
          }));

        setVentaItems(mapped.length ? mapped : [{ tipo: "producto", id: "", cantidad: "1" }]);
        setFormData({
          fecha: String((row as any).fecha || "").slice(0, 10),
          estado: String((row as any).estado ?? "false"),
        });

        setModal("edit");
        return;
      } catch (err: any) {
        console.error("Error cargando items de venta:", err);
        setModal("none");
        setNotifyMsg(err?.message || "Error al cargar items de la venta");
        setModal("notify");
        return;
      }
    }

    setFormData({ ...row });
    setModal("edit");
  };

  const openConfirmDelete = (idx: number) => {
    setCurrentIndex(idx);
    setModal("confirm");
  };

  const submitCreate = async () => {
    try {
      if (active.key === "ventas") {
        const items = ventaItems.map((it, idx) => {
          const cantidad = Number(it.cantidad);
          const id = Number(it.id);
          if (!it.id) throw new Error(`Item #${idx + 1}: selecciona un producto`);
          if (!Number.isFinite(cantidad) || cantidad <= 0) throw new Error(`Item #${idx + 1}: cantidad inválida`);
          if (!Number.isInteger(id) || id <= 0) throw new Error(`Item #${idx + 1}: producto inválido`);
          return { tipo: "producto" as const, ID_producto: id, cantidad };
        });

        await createVentaWithItems({
          fecha: formData.fecha ? String(formData.fecha) : undefined,
          estado: formData.estado === true || formData.estado === "true" || formData.estado === "1",
          items,
        });

        setModal("none");
        setNotifyMsg("Creado correctamente.");
        setModal("notify");
        return;
      }

      if (active.create && active.buildCreatePayload) {
        const payload = active.buildCreatePayload(formData);
        await active.create(payload);
        setModal("none");
        setNotifyMsg("Creado correctamente.");
        setModal("notify");
        return;
      }

      // demo
      const newRow = { ...formData };
      if (idKey && !newRow[idKey]) newRow[idKey] = "ID-" + Math.random().toString(16).slice(2);
      setBaseRows((prev) => [newRow, ...prev]);
      setModal("none");
      setNotifyMsg("¡Creado correctamente (demo)!");
      setModal("notify");
    } catch (err: any) {
      setModal("none");
      setNotifyMsg(err?.message || "Error al crear registro");
      setModal("notify");
    }
  };

  const submitEdit = async () => {
    if (currentIndex == null) return;
    const row = active.rows[currentIndex] as any;

    try {
      if (active.key === "ventas") {
        const idVenta = Number(row.ID_venta);
        if (!Number.isInteger(idVenta) || idVenta <= 0) throw new Error("ID_venta inválido");

        const items = ventaItems.map((it, idx) => {
          const cantidad = Number(it.cantidad);
          const id = Number(it.id);
          if (!it.id) throw new Error(`Item #${idx + 1}: selecciona un producto`);
          if (!Number.isFinite(cantidad) || cantidad <= 0) throw new Error(`Item #${idx + 1}: cantidad inválida`);
          if (!Number.isInteger(id) || id <= 0) throw new Error(`Item #${idx + 1}: producto inválido`);
          return { tipo: "producto" as const, ID_producto: id, cantidad };
        });

        await updateVentaWithItems(idVenta, {
          fecha: formData.fecha ? String(formData.fecha) : undefined,
          estado: formData.estado === true || formData.estado === "true" || formData.estado === "1",
          items,
        });

        setModal("none");
        setCurrentIndex(null);
        setNotifyMsg("Actualizado correctamente.");
        setModal("notify");
        return;
      }

      if (active.update && active.buildUpdatePayload && active.idKey) {
        const id = Number(row[active.idKey]);
        if (!id) throw new Error(`${active.idKey} inválido`);

        const payload = active.buildUpdatePayload(formData, row);
        await active.update(id, payload);

        setModal("none");
        setCurrentIndex(null);
        setNotifyMsg("Actualizado correctamente.");
        setModal("notify");
        return;
      }

      // demo
      setBaseRows((prev) => prev.map((r, i) => (i === currentIndex ? formData : r)));
      setModal("none");
      setCurrentIndex(null);
      setNotifyMsg("Cambios guardados (demo).");
      setModal("notify");
    } catch (err: any) {
      setModal("none");
      setNotifyMsg(err?.message || "Error al actualizar registro");
      setModal("notify");
    }
  };

  

  const confirmDelete = async () => {
    if (currentIndex == null) return;
    const row = active.rows[currentIndex] as any;

    try {
      if (active.remove && active.idKey) {
        const id = Number(row[active.idKey]);
        if (!id) throw new Error(`${active.idKey} inválido`);

        await active.remove(id);
        setModal("none");
        setCurrentIndex(null);
        setNotifyMsg("Eliminado correctamente.");
        setModal("notify");
        return;
      }

      // demo
      setBaseRows((prev) => prev.filter((_, i) => i !== currentIndex));
      setModal("none");
      setCurrentIndex(null);
      setNotifyMsg("Eliminado (demo).");
      setModal("notify");
    } catch (err: any) {
      setModal("none");
      setNotifyMsg(err?.message || "Error al eliminar registro");
      setModal("notify");
    }
  };

  const onChangeField = (key: string, val: any) => setFormData((prev) => ({ ...prev, [key]: val }));

  // Header buttons
  let headerRight: ReactNode = null;

  if (active.key !== "demo") {
    headerRight = (
      <div className="mc-actions">
        {stockSectionKey && (
          <button
            className="mc-btn"
            title={
              isReader
                ? "Solo usuarios con permisos pueden cambiar la configuración"
                : "Configurar colores de stock"
            }
            onClick={() => setStockCfgOpen(true)}
            disabled={!isAdmin}
          >
            <FiSettings />
            Config
          </button>
        )}

        {active.reload && (
          <button className="mc-btn" onClick={active.reload}>
            <FiRefreshCw className={active.loading ? "spin" : ""} />
            Refrescar
          </button>
        )}

        {active.create && canWrite && (
          <button className="mc-btn mc-btn-primary" onClick={openCreate}>
            <FiPlus />
            Crear
          </button>
        )}


        {active.loading && <span style={{ fontSize: 12, opacity: 0.8 }}>Cargando…</span>}
      </div>
    );
  } else if (columns.length > 0) {
    headerRight = !isReader ? (
      <button className="mc-btn mc-btn-primary" onClick={openCreate}>
        <FiPlus />
        Crear
      </button>
    ) : null;
  }


  return (
    <section className="mc-root" aria-label={`Tabla de ${section}`}>
      <div className="mc-page-header">
        <h2 className="mc-title">{section}</h2>
        {headerRight}
      </div>

      {section === "Ventas" && <VentasTabs active={venTab} onChange={setVenTab} />}

      <ErrorBanner msg={active.error} />

      <DataTable
        columns={columns}
        rows={displayRows}
        resourceKey={active.key}
        onEdit={isReadOnly || !canWrite || active.key === "lista_ventas" ? undefined : openEdit}
        onDelete={isReadOnly || !canDelete ? undefined : openConfirmDelete}
        getCellClassName={getCellClassName}
      />

      

      {!isReadOnly && (
        <>
          <Modal
            open={modal === "create"}
            title={active.key === "ventas" ? "Crear venta" : `Crear en ${section}`}
            onClose={closeModal}
            className={active.key === "ventas" ? "mc-card-lg" : ""}
            actions={
              <>
                <button className="md-btn" onClick={closeModal}>Cancelar</button>
                <button className="md-btn primary" onClick={submitCreate}>Guardar</button>
              </>
            }
          >
            {active.key === "ventas" ? (
              <div className="venta-modal">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, opacity: 0.85 }}>Fecha</span>
                    <input
                      className="md-input"
                      type="date"
                      value={String(formData.fecha || "")}
                      onChange={(e) => onChangeField("fecha", e.target.value)}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, opacity: 0.85 }}>Estado</span>
                    <select
                      className="md-input"
                      value={String(formData.estado || "false")}
                      onChange={(e) => onChangeField("estado", e.target.value)}
                    >
                      <option value="false">Pendiente</option>
                      <option value="true">Pagada</option>
                    </select>
                  </label>
                </div>

                <div className="venta-items">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <strong>Items vendidos</strong>
                    <button
                      className="md-btn"
                      type="button"
                      onClick={() => setVentaItems((prev) => [...prev, { tipo: "producto", id: "", cantidad: "1" }])}
                    >
                      + Agregar item
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {ventaItems.map((it, idx) => {
                      const precio = getUnitPrice(it.id);
                      const subtotal = getSubtotal(it);

                      return (
                        <div key={idx} className="venta-item-row">
                          <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Producto</span>
                            <select
                              className="md-input"
                              value={it.id}
                              onChange={(e) =>
                                setVentaItems((prev) => prev.map((p, i) => (i === idx ? { ...p, id: e.target.value } : p)))
                              }
                            >
                              <option value="">-- Selecciona --</option>
                              {productosRows.map((r: any) => (
                                <option key={String(r.ID_producto)} value={String(r.ID_producto)}>
                                  {String(r.nombre)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Cantidad</span>
                            <input
                              className="md-input"
                              type="number"
                              min={0.01}
                              step={0.01}
                              value={it.cantidad}
                              onChange={(e) =>
                                setVentaItems((prev) => prev.map((p, i) => (i === idx ? { ...p, cantidad: e.target.value } : p)))
                              }
                            />
                          </label>

                          <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Precio</span>
                            <input className="md-input" value={String(precio)} readOnly />
                          </label>

                          <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Subtotal</span>
                            <input className="md-input" value={String(subtotal)} readOnly />
                          </label>

                          <button
                            className="md-btn danger"
                            type="button"
                            onClick={() => setVentaItems((prev) => prev.filter((_, i) => i !== idx))}
                            title="Eliminar item"
                            disabled={ventaItems.length === 1}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="venta-total">
                  <div className="venta-total-box">
                    <span style={{ fontSize: 12, opacity: 0.85 }}>Total (calculado)</span>
                    <input className="md-input" value={String(ventaTotal)} readOnly />
                  </div>
                </div>
              </div>
            ) : (
              <FormDinamico
                columns={columns}
                formData={formData}
                onChange={onChangeField}
                excludeKeys={idKey ? [idKey] : []}
                readOnlyKeys={readOnlyKeysCreate}
                ventasOptions={active.key === "lista_ventas" ? ventasRows : undefined}
                productosOptions={active.key === "lista_ventas" ? productosRows : undefined}
              />
            )}
          </Modal>

          <Modal
            open={modal === "edit"}
            title={active.key === "ventas" ? "Editar venta" : `Editar ${section}`}
            onClose={closeModal}
            className={active.key === "ventas" ? "mc-card-lg" : ""}
            actions={
              <>
                <button className="md-btn" onClick={closeModal}>Cancelar</button>
                <button className="md-btn primary" onClick={submitEdit}>Guardar</button>
              </>
            }
          >
            {active.key === "ventas" ? (
              // Reutilizo el mismo UI del create (sin Tipo)
              <div className="venta-modal">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, opacity: 0.85 }}>Fecha</span>
                    <input
                      className="md-input"
                      type="date"
                      value={String(formData.fecha || "")}
                      onChange={(e) => onChangeField("fecha", e.target.value)}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, opacity: 0.85 }}>Estado</span>
                    <select
                      className="md-input"
                      value={String(formData.estado || "false")}
                      onChange={(e) => onChangeField("estado", e.target.value)}
                    >
                      <option value="false">Pendiente</option>
                      <option value="true">Pagada</option>
                    </select>
                  </label>
                </div>

                <div className="venta-items">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <strong>Items vendidos</strong>
                    <button
                      className="md-btn"
                      type="button"
                      onClick={() => setVentaItems((prev) => [...prev, { tipo: "producto", id: "", cantidad: "1" }])}
                    >
                      + Agregar item
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {ventaItems.map((it, idx) => {
                      const precio = getUnitPrice(it.id);
                      const subtotal = getSubtotal(it);

                      return (
                        <div key={idx} className="venta-item-row">
                          <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Producto</span>
                            <select
                              className="md-input"
                              value={it.id}
                              onChange={(e) =>
                                setVentaItems((prev) => prev.map((p, i) => (i === idx ? { ...p, id: e.target.value } : p)))
                              }
                            >
                              <option value="">-- Selecciona --</option>
                              {productosRows.map((r: any) => (
                                <option key={String(r.ID_producto)} value={String(r.ID_producto)}>
                                  {String(r.nombre)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Cantidad</span>
                            <input
                              className="md-input"
                              type="number"
                              min={0.01}
                              step={0.01}
                              value={it.cantidad}
                              onChange={(e) =>
                                setVentaItems((prev) => prev.map((p, i) => (i === idx ? { ...p, cantidad: e.target.value } : p)))
                              }
                            />
                          </label>

                          <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Precio</span>
                            <input className="md-input" value={String(precio)} readOnly />
                          </label>

                          <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Subtotal</span>
                            <input className="md-input" value={String(subtotal)} readOnly />
                          </label>

                          <button
                            className="md-btn danger"
                            type="button"
                            onClick={() => setVentaItems((prev) => prev.filter((_, i) => i !== idx))}
                            title="Eliminar item"
                            disabled={ventaItems.length === 1}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="venta-total">
                  <div className="venta-total-box">
                    <span style={{ fontSize: 12, opacity: 0.85 }}>Total (calculado)</span>
                    <input className="md-input" value={String(ventaTotal)} readOnly />
                  </div>
                </div>
              </div>
            ) : (
              <FormDinamico
                columns={columns}
                formData={formData}
                onChange={onChangeField}
                readOnlyKeys={readOnlyKeysEdit}
                ventasOptions={active.key === "lista_ventas" ? ventasRows : undefined}
                productosOptions={active.key === "lista_ventas" ? productosRows : undefined}
              />
            )}
          </Modal>

          <Modal
            open={modal === "confirm"}
            title="Confirmar eliminación"
            onClose={closeModal}
            actions={
              <>
                <button className="md-btn" onClick={closeModal}>Cancelar</button>
                <button className="md-btn danger" onClick={confirmDelete}>Eliminar</button>
              </>
            }
          >
            <p>¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
          </Modal>
        </>
      )}

      {stockSectionKey && (
        <StockColorConfigModal
          open={stockCfgOpen}
          title={`Configurar colores: ${stockLabels[stockSectionKey]}`}
          value={stockCfg[stockSectionKey]}
          onClose={() => setStockCfgOpen(false)}
          onReset={() => resetStockSection(stockSectionKey)}
          onSave={(next) => {
            setStockSection(stockSectionKey, next);
            setStockCfgOpen(false);
          }}
          disabled={!isAdmin}
        />
      )}

      <Modal
        open={modal === "notify"}
        title="Notificación"
        onClose={() => setModal("none")}
        actions={
          <button className="md-btn primary" onClick={() => setModal("none")}>
            Entendido
          </button>
        }
      >
        <p>{notifyMsg}</p>
      </Modal>
    </section>
  );
}

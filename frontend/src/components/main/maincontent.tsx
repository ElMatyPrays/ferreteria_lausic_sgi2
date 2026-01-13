// src/components/main/maincontent.tsx
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/auth";
import Modal from "../modals/Modal";
import type { Column, Row, Section } from "../main/types";

import VentasTabs from "../main/secciones/ventas/VentasTabs";
import type { VentasSub } from "../main/secciones/ventas/ventas.columns";
import { VENTAS_COLUMNS } from "../main/secciones/ventas/ventas.columns";
import { VENTAS_ROWS_DEMO } from "../main/secciones/ventas/ventas.rows.demo";

import FormDinamico from "../main/formularios/formDinamico";
import { formatRut, isValidRut } from "../../utils/formatRut";
import DataTable from "./tablas/DatosTablas";
import "./maincontent.css";

import { useProductos } from "../../hooks/useProductos";
import { useVentas } from "../../hooks/useVentas";
import { useListaVentas } from "../../hooks/useListaVentas";
import { useClientes } from "../../hooks/useClientes";

import { getStockClass } from "../../utils/stockColor";
import { useStockConfig, type StockSectionKey } from "../../hooks/useStockConfig";
import StockColorConfigModal from "../modals/StockColorConfigModal";

import {
  fetchListaVentas,
  createListaVenta as apiCreateListaVenta,
  updateListaVenta as apiUpdateListaVenta,
  deleteListaVenta as apiDeleteListaVenta,
  type RegistroVentaDTO,
} from "../../services/listaVentasApi";

import { FiSettings, FiRefreshCw, FiPlus } from "react-icons/fi";


/* =========================
   Columnas base (sin tabs)
   ========================= */
const columnsBySection: Record<Section, Column[]> = {
  Productos: [
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
  Clientes: [
    { key: "rut", header: "RUT", width: "140px" },
    { key: "razon_social", header: "Razón social", width: "160px" },
    { key: "tipo_de_compra", header: "Tipo de compra", width: "160px" },
    { key: "giro", header: "Giro", width: "140px", align: "right", numeric: true },
    { key: "direccion", header: "Dirección", width: "160px" },
    { key: "comuna", header: "Comuna", width: "160px" },
    { key: "ciudad", header: "Ciudad", width: "160px" },
    { key: "contacto", header: "Contacto", width: "160px" },
    { key: "tipo_descuento", header: "Tipo descuento", width: "160px" },
  ],
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
  Clientes: [
    { rut: "123456789", razon_social: "Cliente 1", tipo_de_compra: "Compra", giro: "200", direccion: "Calle 1", comuna: "Comuna 1", ciudad: "Ciudad 1", contacto: "Contacto 1", tipo_descuento: 0 },
    { rut: "987654321", razon_social: "Cliente 2", tipo_de_compra: "Compra", giro: "200", direccion: "Calle 2", comuna: "Comuna 2", ciudad: "Ciudad 2", contacto: "Contacto 2", tipo_descuento: 0 },
    { rut: "876543210", razon_social: "Cliente 3", tipo_de_compra: "Compra", giro: "200", direccion: "Calle 3", comuna: "Comuna 3", ciudad: "Ciudad 3", contacto: "Contacto 3", tipo_descuento: 0 },
  ],
};

type ResourceKey = "productos" | "ventas" | "lista_ventas" | "clientes" | "demo";

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

export default function MainContent({ section, venTab: venTabProp, onVenTabChange }: MainContentProps) {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.rol ?? "LECTOR";

  const isAdmin = role === "ADMIN";
  const isOperador = role === "OPERADOR";
  const isReader = role === "LECTOR";

  const canWrite = isAdmin || isOperador;
  const canDelete = isAdmin;

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

  // Productos
  const productosEnabled =
    section === "Productos" || (section === "Ventas" && (venTab === "Lista de ventas" || venTab === "Ventas"));

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
    update: updateVenta,
    remove: removeVenta,
  } = useVentas(ventasEnabled);

  // ✅ Clientes también en Ventas
  const clientesEnabled = section === "Clientes" || section === "Ventas";

  const {
    data: clientesRows,
    loading: clientesLoading,
    error: clientesError,
    reload: reloadClientes,
    create: createCliente,
    update: updateCliente,
    remove: removeCliente,
  } = useClientes(clientesEnabled);

  // Lista ventas
  const listaVentasEnabled = section === "Ventas" && venTab === "Lista de ventas";
  const {
    data: listaVentasRows,
    loading: listaVentasLoading,
    error: listaVentasError,
    reload: reloadListaVentas,
    create: createListaVenta,
    update: updateListaVenta,
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
      empty.estado_pago = "false";
      empty.ID_cliente = ""; // ✅
      return empty;
    },
    buildCreatePayload: (form) => ({
      total: Number(form.total || 0),
      fecha: form.fecha ? String(form.fecha) : undefined,
      estado_pago: form.estado_pago === true || form.estado_pago === "true" || form.estado_pago === "1",
      ID_cliente: form.ID_cliente ? Number(form.ID_cliente) : null,
    }),
    buildUpdatePayload: (form, row) => ({
      total: Number(form.total ?? row.total ?? 0),
      fecha: form.fecha ? String(form.fecha) : String(row.fecha || ""),
      estado_pago: form.estado_pago === true || form.estado_pago === "true" || form.estado_pago === "1",
      ID_cliente: form.ID_cliente ? Number(form.ID_cliente) : null,
    }),
    create: createVenta,
    update: updateVenta,
    remove: removeVenta,
  };

  const listaVentasConfig: CrudConfig = {
    key: "lista_ventas",
    enabled: listaVentasEnabled,
    idKey: "ID_registro_venta",
    rows: listaVentasRows,
    loading: listaVentasLoading,
    error: listaVentasError,
    create: async (payload) => {
      const out = await createListaVenta(payload);
      await reloadListaVentas?.();
      await reloadVentas?.();
      await reloadProductos?.();
      return out;
    },
    update: async (id, payload) => {
      const out = await updateListaVenta(id, payload);
      await reloadListaVentas?.();
      await reloadVentas?.();
      await reloadProductos?.();
      return out;
    },
    remove: async (id) => {
      const out = await removeListaVenta(id);
      await reloadListaVentas?.();
      await reloadVentas?.();
      await reloadProductos?.();
      return out;
    },
    reload: reloadListaVentas,
    buildEmptyForm: (cols) => {
      const empty: Row = {};
      cols.forEach((c) => (empty[c.key] = ""));
      empty.ID_venta = "";
      empty.ID_producto = "";
      empty.cantidad = 1;
      return empty;
    },
    buildCreatePayload: (form) => {
      const payload = {
        ID_venta: Number(form.ID_venta),
        ID_producto: Number(form.ID_producto),
        cantidad: Number(form.cantidad),
      };

      if (!payload.ID_venta) throw new Error("Debes ingresar un ID_venta válido.");
      if (!payload.ID_producto) throw new Error("Debes seleccionar un producto.");
      if (!payload.cantidad || payload.cantidad <= 0) throw new Error("La cantidad debe ser mayor que 0.");

      return payload;
    },
    buildUpdatePayload: (form) => {
      const payload: any = {};
      if (form.cantidad != null && String(form.cantidad) !== "") payload.cantidad = Number(form.cantidad);
      return payload;
    },
  };

  const clientesConfig: CrudConfig = {
    key: "clientes",
    enabled: clientesEnabled,
    idKey: "ID_cliente",
    rows: clientesRows,
    loading: clientesLoading,
    error: clientesError,
    reload: reloadClientes,
    buildEmptyForm: (cols) => {
      const empty: Row = {};
      cols.forEach((c) => (empty[c.key] = ""));
      empty.giro = 0;
      empty.tipo_descuento = 0;
      return empty;
    },
    buildCreatePayload: (form) => ({
      rut: formatRut(String(form.rut || "")),
      razon_social: String(form.razon_social || ""),
      tipo_de_compra: String(form.tipo_de_compra || ""),
      giro: String(form.giro || ""),
      direccion: String(form.direccion || ""),
      comuna: String(form.comuna || ""),
      ciudad: String(form.ciudad || ""),
      contacto: String(form.contacto || ""),
      tipo_descuento: Number(form.tipo_descuento || 0),
    }),
    buildUpdatePayload: (form) => ({
      rut: formatRut(String(form.rut || "")),
      razon_social: String(form.razon_social || ""),
      tipo_de_compra: String(form.tipo_de_compra || ""),
      giro: String(form.giro || ""),
      direccion: String(form.direccion || ""),
      comuna: String(form.comuna || ""),
      ciudad: String(form.ciudad || ""),
      contacto: String(form.contacto || ""),
      tipo_descuento: Number(form.tipo_descuento || 0),
    }),
    create: createCliente,
    update: updateCliente,
    remove: removeCliente,
  };

  const demoEnabled = !productosEnabled && !ventasEnabled && !listaVentasEnabled;
  const demoConfig: CrudConfig = {
    key: "demo",
    enabled: demoEnabled,
    rows: baseRows,
    loading: false,
    error: null,
  };

  let active: CrudConfig;

  if (section === "Ventas") {
    if (venTab === "Ventas") active = ventasConfig;
    else if (venTab === "Lista de ventas") active = listaVentasConfig;
    else active = demoConfig;
  } else if (section === "Productos") {
    active = productosConfig;
  } else if (section === "Clientes") {
    active = clientesConfig;
  } else {
    active = demoConfig;
  }
  const isListaVentas = active.key === "lista_ventas";
  const readOnlyKeysListaVentas = ["ID_registro_venta", "ID_venta", "ID_producto", "subtotal"];

  const { config: stockCfg, setSection: setStockSection, resetSection: resetStockSection, labels: stockLabels } =
    useStockConfig();

  const [stockCfgOpen, setStockCfgOpen] = useState(false);

  const stockSectionKey: StockSectionKey | null = active.key === "productos" ? ("productos" as StockSectionKey) : null;

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
  // Ventas: UI items (productos)
  // =========================
  type VentaItemUI = {
    tipo: "producto";
    registroId?: number;
    id: string; // ID_producto
    cantidad: string;
  };

  const EMPTY_ITEM: VentaItemUI = { tipo: "producto", id: "", cantidad: "1" };

  const [ventaItems, setVentaItems] = useState<VentaItemUI[]>([]);
  const [ventaItemsOriginal, setVentaItemsOriginal] = useState<VentaItemUI[]>([]);
  const [ventaBarcodes, setVentaBarcodes] = useState<string[]>([]);

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

  const ventaTotal = useMemo(
    () => round2(ventaItems.reduce((acc, it) => acc + getSubtotal(it), 0)),
    [ventaItems, productosRows]
  );

  // ✅ mantener barcodes sincronizado con items
  useEffect(() => {
    setVentaBarcodes((prev) => {
      if (prev.length === ventaItems.length) return prev;
      if (prev.length < ventaItems.length) return [...prev, ...new Array(ventaItems.length - prev.length).fill("")];
      return prev.slice(0, ventaItems.length);
    });
  }, [ventaItems.length]);

  // ✅ Auto-focus
  useEffect(() => {
    if (active.key !== "ventas") return;
    if (modal !== "create" && modal !== "edit") return;

    setTimeout(() => {
      const el = document.getElementById("venta-barcode-0") as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }, [modal, active.key]);

  const findProductoByBarcode = (raw: string) => {
    const code = String(raw || "").trim();
    if (!code) return null;

    const found =
      (productosRows as any[]).find((r) => String((r as any).codigo_barras || "").trim() === code) ??
      (productosRows as any[]).find((r) => String((r as any).SKU || "").trim() === code);

    return found ? String((found as any).ID_producto) : null;
  };

  const applyBarcodeToItem = (idx: number) => {
    const code = (ventaBarcodes[idx] ?? "").trim();
    if (!code) return;

    const foundId = findProductoByBarcode(code);
    if (!foundId) {
      window.alert(`No se encontró producto para código: ${code}`);
      return;
    }

    setVentaItems((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === foundId);
      if (existingIndex !== -1) {
        return prev.map((p, i) => {
          if (i !== existingIndex) return p;
          return { ...p, cantidad: String((Number(p.cantidad) || 0) + 1) };
        });
      }

      if (!prev[idx]?.id) {
        return prev.map((p, i) => (i === idx ? { ...p, id: foundId, cantidad: p.cantidad || "1" } : p));
      }

      return [...prev, { ...EMPTY_ITEM, id: foundId, cantidad: "1" }];
    });

    setVentaBarcodes((prev) => prev.map((v, i) => (i === idx ? "" : v)));

    setTimeout(() => {
      const el = document.getElementById("venta-barcode-0") as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  };

  const closeModal = () => setModal("none");

  const openCreate = () => {
    if (active.key === "ventas") {
      // ✅ Crear venta ahora es una página dedicada (no modal)
      navigate("/ventas/crear");
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

        const items: RegistroVentaDTO[] = await fetchListaVentas({ ID_venta: idVenta });

        const mapped: VentaItemUI[] = items
          .filter((it) => Number((it as any).ID_producto) && Number((it as any).ID_producto) > 0)
          .map((it) => ({
            tipo: "producto" as const,
            registroId: Number((it as any).ID_registro_venta),
            id: String((it as any).ID_producto),
            cantidad: String((it as any).cantidad ?? 1),
          }));

        const initial: VentaItemUI[] = mapped.length ? mapped : [{ ...EMPTY_ITEM }];
        setVentaItems(initial);
        setVentaItemsOriginal(initial);
        setVentaBarcodes(new Array(initial.length).fill(""));

        setFormData({
          ID_cliente: String((row as any).ID_cliente ?? ""), // ✅
          fecha: String((row as any).fecha || "").slice(0, 10),
          estado_pago: String((row as any).estado_pago ?? "false"),
        });

        setModal("edit");
        return;
      } catch (err: any) {
        console.error(err);
        setModal("none");
        setNotifyMsg(err?.message || "Error al cargar items de la venta");
        setModal("notify");
        return;
      }
    }

    setFormData({ ...(row as any) });
    setModal("edit");
  };

  const openConfirmDelete = (idx: number) => {
    setCurrentIndex(idx);
    setModal("confirm");
  };

  const submitCreate = async () => {
    try {
      if (active.key === "clientes") {
        const rut = String(formData.rut || "");
        if (!isValidRut(rut)) throw new Error("RUT inválido (DV incorrecto). Ej: 21880999-5");
      }

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
          ID_cliente: formData.ID_cliente ? Number(formData.ID_cliente) : null, // ✅
          fecha: formData.fecha ? String(formData.fecha) : undefined,
          estado_pago: formData.estado_pago === true || formData.estado_pago === "true" || formData.estado_pago === "1",
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

      const newRow = { ...formData };
      if (idKey && !newRow[idKey]) newRow[idKey] = "ID-" + Math.random().toString(16).slice(2);
      setBaseRows((prev) => [...prev, newRow]);
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
      if (active.key === "clientes") {
        const rut = String(formData.rut || "");
        if (!isValidRut(rut)) throw new Error("RUT inválido (DV incorrecto).");
      }

      if (active.key === "ventas") {
        const idVenta = Number(row.ID_venta);
        if (!Number.isInteger(idVenta) || idVenta <= 0) throw new Error("ID_venta inválido");

        const currentItems = ventaItems.map((it, idx) => {
          const cantidad = Number(it.cantidad);
          const idProd = Number(it.id);

          if (!it.id) throw new Error(`Item #${idx + 1}: selecciona un producto`);
          if (!Number.isFinite(cantidad) || cantidad <= 0) throw new Error(`Item #${idx + 1}: cantidad inválida`);
          if (!Number.isInteger(idProd) || idProd <= 0) throw new Error(`Item #${idx + 1}: producto inválido`);

          return {
            registroId: it.registroId,
            ID_producto: idProd,
            cantidad,
          };
        });

        await updateVenta(idVenta, {
          ID_cliente: formData.ID_cliente ? Number(formData.ID_cliente) : null, // ✅
          total: ventaTotal,
          fecha: formData.fecha ? String(formData.fecha) : undefined,
          estado_pago: formData.estado_pago === true || formData.estado_pago === "true" || formData.estado_pago === "1",
        });

        const prev = (ventaItemsOriginal ?? []).filter((x) => x.registroId != null);
        const prevByReg = new Map<number, VentaItemUI>();
        prev.forEach((p) => prevByReg.set(Number(p.registroId), p));

        const currentByReg = new Map<number, { ID_producto: number; cantidad: number }>();
        currentItems.forEach((c) => {
          if (c.registroId != null) currentByReg.set(Number(c.registroId), c);
        });

        // eliminados
        for (const [regId] of prevByReg.entries()) {
          if (!currentByReg.has(regId)) await apiDeleteListaVenta(regId);
        }

        // updates / cambio producto
        for (const [regId, cur] of currentByReg.entries()) {
          const old = prevByReg.get(regId);
          if (!old) continue;

          const oldProd = Number(old.id);
          const oldQty = Number(old.cantidad);

          if (oldProd !== cur.ID_producto) {
            await apiDeleteListaVenta(regId);
            await apiCreateListaVenta({ ID_venta: idVenta, ID_producto: cur.ID_producto, cantidad: cur.cantidad });
            continue;
          }

          if (oldQty !== cur.cantidad) {
            await apiUpdateListaVenta(regId, { cantidad: cur.cantidad });
          }
        }

        // nuevos
        for (const cur of currentItems) {
          if (cur.registroId != null) continue;
          await apiCreateListaVenta({ ID_venta: idVenta, ID_producto: cur.ID_producto, cantidad: cur.cantidad });
        }

        await reloadVentas?.();
        await reloadProductos?.();

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

  const onChangeField = (key: string, val: any) => {
    if (key === "rut") {
      setFormData((prev) => ({ ...prev, rut: formatRut(String(val)) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  // Header buttons
  let headerRight: ReactNode = null;

  if (active.key !== "demo") {
    headerRight = (
      <div className="mc-actions">
        {stockSectionKey && (
          <button
            className="mc-btn"
            title={isReader ? "Solo usuarios con permisos pueden cambiar la configuración" : "Configurar colores de stock"}
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

        {/* Ventas ahora se crean en una página dedicada (navbar), no desde modal */}
        {active.create && canWrite && active.key !== "ventas" && (
          <button className="mc-btn mc-btn-primary" onClick={openCreate}>
            <FiPlus />
            {`Crear ${section}`}
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
        onDelete={isReadOnly || !canDelete || active.key === "lista_ventas" ? undefined : openConfirmDelete}
        getCellClassName={getCellClassName}
      />

      {!isReadOnly && (
        <>
          {/* CREATE (ventas ahora se crea en una página dedicada) */}
          {active.key !== "ventas" && (
            <Modal
              open={modal === "create"}
              title={`Crear en ${section}`}
              onClose={closeModal}
              actions={
                <>
                  <button className="md-btn" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button className="md-btn primary" onClick={submitCreate}>
                    Guardar
                  </button>
                </>
              }
            >
              <FormDinamico
                columns={columns}
                formData={formData}
                onChange={onChangeField}
                excludeKeys={active.key === "lista_ventas" ? ["ID_registro_venta", "subtotal"] : undefined}
                readOnlyKeys={readOnlyKeysCreate}
                ventasOptions={active.key === "lista_ventas" ? ventasRows : undefined}
                productosOptions={active.key === "lista_ventas" ? productosRows : undefined}
              />
            </Modal>
          )}

          {/* EDIT */}
          <Modal
            open={modal === "edit"}
            title={active.key === "ventas" ? "Editar venta" : `Editar ${section}`}
            onClose={closeModal}
            className={active.key === "ventas" ? "mc-card-lg" : ""}
            actions={
              <>
                <button className="md-btn" onClick={closeModal}>
                  Cancelar
                </button>
                <button className="md-btn primary" onClick={submitEdit}>
                  Guardar
                </button>
              </>
            }
          >
            {active.key === "ventas" ? (
              <div className="venta-modal">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
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
                      value={String(formData.estado_pago || "false")}
                      onChange={(e) => onChangeField("estado_pago", e.target.value)}
                    >
                      <option value="false">Pendiente</option>
                      <option value="true">Pagada</option>
                    </select>
                  </label>

                  {/* ✅ Cliente */}
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, opacity: 0.85 }}>Cliente</span>
                    <select
                      className="md-input"
                      value={String(formData.ID_cliente || "")}
                      onChange={(e) => onChangeField("ID_cliente", e.target.value)}
                      disabled={clientesLoading}
                    >
                      <option value="">{clientesLoading ? "Cargando..." : "-- Sin cliente --"}</option>
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
                    <strong>Items vendidos</strong>
                    <button
                      className="md-btn"
                      type="button"
                      onClick={() => setVentaItems((prev) => [...prev, { ...EMPTY_ITEM }])}
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
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Código barras</span>
                            <input
                              className="md-input"
                              id={`venta-barcode-${idx}`}
                              inputMode="numeric"
                              placeholder="Escanea y presiona Enter"
                              value={ventaBarcodes[idx] ?? ""}
                              onChange={(e) =>
                                setVentaBarcodes((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
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
                                setVentaItems((prev) =>
                                  prev.map((p, i) => (i === idx ? { ...p, cantidad: e.target.value } : p))
                                )
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
                            onClick={() => {
                              setVentaItems((prev) => prev.filter((_, i) => i !== idx));
                              setVentaBarcodes((prev) => prev.filter((_, i) => i !== idx));
                            }}
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
                excludeKeys={isListaVentas ? ["subtotal"] : undefined}
                readOnlyKeys={isListaVentas ? readOnlyKeysListaVentas : readOnlyKeysEdit}
                ventasOptions={isListaVentas ? ventasRows : undefined}
                productosOptions={isListaVentas ? productosRows : undefined}
              />
            )}
          </Modal>

          {/* CONFIRM DELETE */}
          <Modal
            open={modal === "confirm"}
            title="Confirmar eliminación"
            onClose={closeModal}
            actions={
              <>
                <button className="md-btn" onClick={closeModal}>
                  Cancelar
                </button>
                <button className="md-btn danger" onClick={confirmDelete}>
                  Eliminar
                </button>
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

      {/* NOTIFY */}
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

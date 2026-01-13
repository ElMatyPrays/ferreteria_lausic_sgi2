// src/components/main/formularios/formDinamico.tsx

import type { Column, Row } from "../types";

interface FormDinamicoProps {
  columns: Column[];
  formData: Row;
  onChange: (key: string, value: any) => void;
  excludeKeys?: string[];
  readOnlyKeys?: string[];

  // Útiles si en el futuro habilitas crear/editar en "Lista de ventas"
  ventasOptions?: Row[];
  productosOptions?: Row[];
}

export default function FormDinamico({
  columns,
  formData,
  onChange,
  excludeKeys = [],
  readOnlyKeys = [],
  ventasOptions = [],
  productosOptions = [],
}: FormDinamicoProps) {
  const isReadOnly = (key: string) => readOnlyKeys.includes(key);

  const renderInput = (c: Column) => {
    const key = c.key;
    const ro = isReadOnly(key);
    const value = formData[key] ?? "";

    // Selects (por si se usa en Lista de ventas)
    if (key === "ID_venta" && ventasOptions.length > 0) {
      return (
        <select
          className="fg-select"
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          disabled={ro}
        >
          <option value="">Selecciona venta...</option>
          {ventasOptions.map((v) => (
            <option key={String(v.ID_venta)} value={String(v.ID_venta)}>
              {`Venta #${v.ID_venta}${v.fecha ? " - " + v.fecha : ""}`}
            </option>
          ))}
        </select>
      );
    }

    if (key === "ID_producto" && productosOptions.length > 0) {
      return (
        <select
          className="fg-select"
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          disabled={ro}
        >
          <option value="">Selecciona producto...</option>
          {productosOptions.map((p) => (
            <option key={String(p.ID_producto)} value={String(p.ID_producto)}>
              {p.nombre || `Producto #${p.ID_producto}`}
            </option>
          ))}
        </select>
      );
    }

    // Fechas
    if (key.toLowerCase().includes("fecha")) {
      return (
        <input
          className="fg-input"
          type="date"
          value={String(value).slice(0, 10)}
          onChange={(e) => onChange(key, e.target.value)}
          disabled={ro}
        />
      );
    }

    // Números
    if (c.numeric) {
      return (
        <input
          className="fg-input"
          type="number"
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          disabled={ro}
        />
      );
    }

    // Default (texto)
    return (
      <input
        className="fg-input"
        type="text"
        value={String(value)}
        onChange={(e) => onChange(key, e.target.value)}
        disabled={ro}
      />
    );
  };

  return (
    <div className="form-grid">
      {columns
        .filter((c) => !excludeKeys.includes(c.key))
        .map((c) => (
          <label key={c.key} className="fg-item">
            <span>{c.header}</span>
            {renderInput(c)}
          </label>
        ))}
    </div>
  );
}

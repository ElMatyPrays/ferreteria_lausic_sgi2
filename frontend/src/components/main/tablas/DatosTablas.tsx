//src/components/main/tablas/DatosTablas.tsx
import { FiEdit2, FiTrash2 } from "react-icons/fi";

import "./tabla.css";

export interface Column {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
}
export type Row = Record<string, any>;

interface Props {
  columns: Column[];
  rows: Row[];
  resourceKey?: string; // ej: "ventas", "souvenirs", ...
  onEdit?: (i: number) => void;
  onDelete?: (i: number) => void;
  getCellClassName?: (col: Column, row: Row) => string | undefined;
}

function normalizeEstadoPago(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;

  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "pagado" || s === "pago" || s === "pagada") return true;

    if (
      s === "false" ||
      s === "0" ||
      s === "pendiente" ||
      s === "por pagar" ||
      s === "porpagar" ||
      s === "por_pagar"
    )
      return false;
  }

  return false;
}

export default function DataTable({
  columns,
  rows,
  resourceKey,
  onEdit,
  onDelete,
  getCellClassName,
}: Props) {
  const hasData = rows.length > 0;

  return (
    <div className="mc-table-wrap">
      <table className="mc-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={c.align ? `mc-align-${c.align}` : ""}
              >
                {c.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th style={{ width: "100px" }} className="mc-align-center">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {!hasData && (
            <tr>
              <td className="mc-empty" colSpan={columns.length + ((onEdit || onDelete) ? 1 : 0)}>
                Sin datos por ahora. Seleccione alguna opción.
              </td>
            </tr>
          )}

          {hasData &&
            rows.map((row, idx) => (
              <tr key={idx}>
                {columns.map((c) => {
                  const alignClass = c.align ? `mc-align-${c.align}` : "";
                  const extraClass = getCellClassName ? getCellClassName(c, row) || "" : "";
                  const cellValue = row[c.key];

                  // ✅ Ventas: estado (pero SOLO cuando estoy en recurso "ventas")
                  const isEstadoPagoVentas =
                    (c.key === "estado" || c.key === "Estado") && resourceKey === "ventas";

                  const shouldFormatPago = isEstadoPagoVentas;
                  const isPaid = shouldFormatPago ? normalizeEstadoPago(cellValue) : false;

                  return (
                    <td key={c.key} className={`${alignClass} ${extraClass}`.trim()}>
                      {c.key === "archivo_url" && cellValue ? (
                        <a
                          href={String(cellValue)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dt-file-link"
                        >
                          Ver archivo
                        </a>
                      ) : shouldFormatPago ? (
                        <span className={isPaid ? "dt-estado-pago" : "dt-estado-pendiente"}>
                          {isPaid ? "Pagada" : "Pendiente"}
                        </span>
                      ) : (
                        cellValue ?? "—"
                      )}
                    </td>
                  );
                })}

                <td className="mc-align-center">
                  <div className="mc-actions">
                    {onEdit && (
                      <button className="mc-icon-btn mc-edit" title="Editar" onClick={() => onEdit(idx)}>
                        <FiEdit2 />
                      </button>
                    )}
                    {onDelete && (
                      <button className="mc-icon-btn mc-danger" title="Eliminar" onClick={() => onDelete(idx)}>
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

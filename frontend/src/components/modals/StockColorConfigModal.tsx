import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import type { StockThresholds } from "../../utils/stockColor";

type Props = {
  open: boolean;
  title: string;
  value: StockThresholds;
  onClose: () => void;
  onSave: (next: StockThresholds) => void;
  onReset: () => void;
  disabled?: boolean;
};

export default function StockColorConfigModal({
  open,
  title,
  value,
  onClose,
  onSave,
  onReset,
  disabled,
}: Props) {
  const [redMax, setRedMax] = useState<number>(value.redMax);
  const [yellowMax, setYellowMax] = useState<number>(value.yellowMax);

  useEffect(() => {
    if (!open) return;
    setRedMax(value.redMax);
    setYellowMax(value.yellowMax);
  }, [open, value.redMax, value.yellowMax]);

  const error = useMemo(() => {
    if (redMax < 0 || yellowMax < 0) return "Los valores no pueden ser negativos.";
    if (redMax > yellowMax) return "El umbral ROJO debe ser menor o igual al AMARILLO.";
    return "";
  }, [redMax, yellowMax]);

  const actions = (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button className="mc-btn" onClick={onClose}>
        Cancelar
      </button>

      <button className="mc-btn" onClick={onReset} disabled={!!disabled}>
        Restaurar
      </button>

      <button
        className="mc-btn mc-btn-primary"
        disabled={!!disabled || !!error}
        onClick={() => onSave({ redMax, yellowMax })}
      >
        Guardar
      </button>
    </div>
  );

  return (
    <Modal open={open} title={title} onClose={onClose} actions={actions}>
      <div style={{ display: "grid", gap: 10, padding: 12 }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85, lineHeight: 1.4 }}>
          Reglas: <b>0</b> siempre es gris. De <b>1</b> hasta <b>ROJO</b> es rojo,
          luego hasta <b>AMARILLO</b> es amarillo, y sobre eso queda verde.
        </p>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, opacity: 0.9 }}>Rojo hasta (incluye)</span>
          <input
            type="number"
            value={redMax}
            min={0}
            className="md-input"
            onChange={(e) => setRedMax(Number(e.target.value))}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, opacity: 0.9 }}>Amarillo hasta (incluye)</span>
          <input
            type="number"
            value={yellowMax}
            min={0}
            className="md-input"
            onChange={(e) => setYellowMax(Number(e.target.value))}
          />
        </label>

        {error && (
          <div style={{ fontSize: 12, color: "#ef4444" }}>
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

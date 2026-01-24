import type { Usuario } from "../../services/usuariosApi";

type Props = {
  open: boolean;
  usuario: Usuario | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function EliminarUsuarioModal({ open, usuario, onClose, onConfirm }: Props) {
  if (!open || !usuario) return null;

  return (
    <div className="md-backdrop" onClick={onClose}>
      {/* 👇 Evita que el click dentro cierre */}
      <div className="usuarios-card" style={{ maxWidth: 520, width: "92vw" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h3 className="usuarios-h3" style={{ margin: 0 }}>Confirmar eliminación</h3>
          <button className="md-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <p style={{ margin: 0 }}>
            ¿Seguro que deseas eliminar al usuario <strong>{usuario.nombre}</strong>?
          </p>
          <p style={{ margin: "8px 0 0", opacity: 0.85 }}>
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
          <button className="usuarios-btn secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="md-btn danger" type="button" onClick={() => onConfirm()}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

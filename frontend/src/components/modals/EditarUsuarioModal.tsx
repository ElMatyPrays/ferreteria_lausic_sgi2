// src/components/modals/EditarUsuarioModal.tsx
import { useEffect, useState } from "react";
import type { RolUsuario, Usuario } from "../../services/usuariosApi";

const ROLES: RolUsuario[] = ["ADMIN", "OPERADOR", "LECTOR"];

type Props = {
  open: boolean;
  usuario: Usuario | null;
  onClose: () => void;
  onSave: (id: number, data: {
    nombre: string;
    email: string;
    rol: RolUsuario;
  }) => Promise<void>;
};

export function EditarUsuarioModal({ open, usuario, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<RolUsuario>("OPERADOR");

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre);
      setEmail(usuario.email);
      setRol(usuario.rol);
    }
  }, [usuario]);

  if (!open || !usuario) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(usuario.ID_usuario, { nombre, email, rol });
    onClose();
  };

  return (
    <div className="md-backdrop">
      <div className="usuarios-card" style={{ maxWidth: 420 }}>
        <h3 className="usuarios-h3">Editar usuario</h3>

        <form className="usuarios-form" onSubmit={submit}>
          <div className="usuarios-field">
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div className="usuarios-field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="usuarios-field">
            <label>Rol</label>
            <select value={rol} onChange={(e) => setRol(e.target.value as RolUsuario)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="button" className="usuarios-btn secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="usuarios-btn" type="submit">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

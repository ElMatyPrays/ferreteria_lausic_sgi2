//src/pages/Usuarios/Usuarios.tsx
import { useEffect, useState } from "react";
import "./usuarios.css";
import { Navbar } from "../../components/navbar/navbar";

import type { CreateUsuarioDTO, RolUsuario, Usuario } from "../../services/usuariosApi";
import { createUsuario, getUsuarios } from "../../services/usuariosApi";
import { updateUsuario, deleteUsuario } from "../../services/usuariosApi";
import { EliminarUsuarioModal } from "../../components/modals/EliminarUsuarioModal";
import { EditarUsuarioModal } from "../../components/modals/EditarUsuarioModal";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const ROLES: RolUsuario[] = ["ADMIN", "OPERADOR", "LECTOR"];




export default function Usuarios() {
  const [items, setItems] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Usuario | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Usuario | null>(null);
  



  const [form, setForm] = useState<CreateUsuarioDTO>({
    nombre: "",
    email: "",
    password: "",
    rol: "OPERADOR",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getUsuarios();
      console.log("usuarios raw:", data);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUsuario(form);
      setForm({ nombre: "", email: "", password: "", rol: "OPERADOR" });
      await load();
      alert("Usuario creado ");
    } catch (err: any) {
      alert(err?.message || "Error al crear usuario");
    }
  };
  const onEdit = (u: Usuario) => {
    setSelected(u);
    setEditOpen(true);
  };

  const onDelete = (u: Usuario) => {
    setToDelete(u);
    setConfirmOpen(true);
  };


  const confirmDelete = async () => {
    if (!toDelete) return;

    try {
      
      await deleteUsuario(toDelete.ID_usuario);
      setConfirmOpen(false);
      setToDelete(null);
      await load();
    } catch (err: any) {
      alert(err?.message || "Error al eliminar usuario");
    } finally {
      
    }
  };



  const onSaveEdit = async (id: number, data: any) => {
    await updateUsuario(id, data);
    await load();
  };


  return (
    <div>
      <Navbar />

      <main className="main_data">
        <div className="usuarios-wrap">
          <header className="usuarios-header">
            <h2 className="usuarios-h2">Usuarios</h2>
            <p className="usuarios-sub">
              Crea usuarios y asigna roles (ADMIN / OPERADOR / LECTOR).
            </p>
          </header>

          <div className="usuarios-grid">
            {/* Card: Crear usuario */}
            <section className="usuarios-card">
              <h3 className="usuarios-h3">Crear usuario</h3>

              <form className="usuarios-form" onSubmit={onSubmit}>
                <div className="usuarios-field">
                  <label>Nombre</label>
                  <input
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="usuarios-field">
                  <label>Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ejemplo@correo.cl"
                  />
                </div>

                <div className="usuarios-field">
                  <label>Contraseña</label>
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="usuarios-field">
                  <label>Rol</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value as RolUsuario })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="usuarios-btn" type="submit">
                  Crear
                </button>
              </form>
            </section>

            {/* Card: Listado */}
            <section className="usuarios-card">
              <div className="usuarios-card-head">
                <h3 className="usuarios-h3">Listado</h3>
                <button className="usuarios-btn secondary" type="button" onClick={load}>
                  Recargar
                </button>
              </div>

              {loading ? (
                <p className="usuarios-muted">Cargando...</p>
              ) : (
                <div className="usuarios-table-wrap">
                  <table className="usuarios-table">
                    <thead>
                      <tr>
                        <th style={{ width: 90 }}>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th style={{ width: 140 }}>Rol</th>
                        <th style={{ width: 140 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((u) => (
                        <tr key={u.ID_usuario}>
                          <td>{u.ID_usuario}</td>
                          <td>{u.nombre}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`usuarios-badge ${u.rol.toLowerCase()}`}>
                              {u.rol}
                            </span>
                          </td>
                          <td className="mc-align-center">
                            <div className="mc-actions">
                              {onEdit && (
                                <button className="mc-icon-btn mc-edit"  title="Editar" onClick={() => onEdit(u)}>
                                  <FiEdit2 />
                                </button>
                              )}
                              {onDelete && (
                                <button className="mc-icon-btn mc-danger"  title="Eliminar" onClick={() => onDelete(u)}>
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={4} className="usuarios-muted">
                            No hay usuarios.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
        <EditarUsuarioModal
          open={editOpen}
          usuario={selected}
          onClose={() => {
            setEditOpen(false);
            setSelected(null);
          }}
          onSave={onSaveEdit}
        />

        <EliminarUsuarioModal
          open={confirmOpen}
          usuario={toDelete}
          onClose={() => {
            setConfirmOpen(false);
            setToDelete(null);
          }}
          onConfirm={confirmDelete}
        />





      </main>
    </div>
  );
}

import { NavLink } from "react-router-dom";
import "./navbar.css";
import { getUser } from "../../utils/auth";
import { logout } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const user = getUser();
  const rol = user?.rol; // "ADMIN" | "OPERADOR" | "LECTOR"

  const canSeeUsuarios = rol === "ADMIN"; // solo admin ve usuarios
  

  
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };


  return (

    
    <nav className="navbar">
      <div className="navbar-content">
        <header className="navbar-header">
          <h1>INVENTARIO</h1>
        </header>

        <section className="navbar-links">
          <ul>
            <li>
              <NavLink to="/productos" className={({ isActive }) => (isActive ? "active" : "")}>
                Productos
              </NavLink>
            </li>
            
              
            <li>
              <NavLink to="/ventas" className={({ isActive }) => (isActive ? "active" : "")}>
                Ventas
              </NavLink>
            </li>
            
      

            {canSeeUsuarios && (
              <li>
                <NavLink to="/usuarios" className={({ isActive }) => (isActive ? "active" : "")}>
                  Usuarios
                </NavLink>
              </li>
            )}

            <li>
              <button type="button" className="sb-logout" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </li>
            
          </ul>
        </section>
      </div>
    </nav>
  );
}

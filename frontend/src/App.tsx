//src/App.tsx
import { Route, Routes, Navigate } from "react-router-dom";
import Ventas from "./pages/Ventas/ventas";
import Login from "./pages/login/login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Usuarios from "./pages/Usuarios/Usuarios";
import Productos from "./pages/Productos/productos";
import Clientes from "./pages/Clientes/clientes";

function App() {
  const token = sessionStorage.getItem("token"); // ✅ antes localStorage

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/productos" replace /> : <Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
      <Route path="/ventas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
      <Route path="/usuarios" element={<ProtectedRoute roles={["ADMIN"]}><Usuarios /></ProtectedRoute>} />
    

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

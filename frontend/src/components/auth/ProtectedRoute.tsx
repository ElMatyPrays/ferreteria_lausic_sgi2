import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUser } from "../../utils/auth";

type Rol = "ADMIN" | "OPERADOR" | "LECTOR";

type Props = { children: ReactNode; roles?: Rol[] };

export default function ProtectedRoute({ children, roles }: Props) {
  const location = useLocation();
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/productos" replace />;
  }

  return <>{children}</>;
}

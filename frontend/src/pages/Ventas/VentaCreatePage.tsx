import { useNavigate } from "react-router-dom";
import VentaForm from "../../components/main/formularios/VentaForm";
import "./ventaCreatePage.css";

export default function VentaCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="venta-page">
      <div className="venta-page-inner">
        <VentaForm
          mode="create"
          autoFocusBarcode
          onCancel={() => navigate(-1)}
          onSuccess={() => navigate("/ventas")}
        />
      </div>
    </div>
  );
}

// src/pages/ventas/ventas.tsx
import { useState } from "react";
import { Navbar } from "../../components/navbar/navbar";
import MainContent from "../../components/main/maincontent";
import type { VentasSub } from "../../components/main/secciones/ventas/ventas.columns";


function Ventas() {

  const [venTab, setVenTab] = useState<VentasSub>("Ventas");

  
  return (
    <div>
      <Navbar/>
      <main className="main_data">
        
        <MainContent
          section="Ventas"
          venTab={venTab}
          onVenTabChange={setVenTab}
        />

      </main>
    </div>
  );
}

export default Ventas;

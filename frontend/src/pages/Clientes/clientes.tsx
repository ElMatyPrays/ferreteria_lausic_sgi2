// src/pages/clientes/clientes.tsx
import { Navbar } from "../../components/navbar/navbar";
import MainContent from "../../components/main/maincontent";


function Clientes() {
  return (
    <div>
      <Navbar />
      <main className="main_data">
        <MainContent
          section="Clientes"
        />
      </main>
    </div>
  );
}

export default Clientes;
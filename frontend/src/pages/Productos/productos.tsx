// src/pages/souvenirs/Souvenirs.tsx
import { Navbar } from "../../components/navbar/navbar";

import MainContent from "../../components/main/maincontent";



function Productos() {
  return (
    <div>
      <Navbar />
      <main className="main_data">
        <MainContent
          section="Productos"
        />
      </main>
    </div>
  );
}

export default Productos;

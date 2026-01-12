// src/components/main/secciones/ventas/VentasTabs.tsx

import Tabs from "../../tabs";
import { VENTAS_TABS } from "./ventas.columns";
import type { VentasSub } from "./ventas.columns";




export default function VentasTabs({
  active, onChange,
}: { active: VentasSub; onChange: (t: VentasSub) => void; }) {
  return <Tabs tabs={VENTAS_TABS} active={active} onChange={onChange} />;
}

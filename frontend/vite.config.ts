import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  // Eliminamos el proxy de aquí porque en producción usaremos URLs absolutas o relativas
  build: {
    outDir: 'dist',
  }
});
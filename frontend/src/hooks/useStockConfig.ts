import { useCallback, useEffect, useMemo, useState } from "react";
import type { StockThresholds } from "../utils/stockColor";
import { DEFAULT_STOCK_THRESHOLDS } from "../utils/stockColor";

export type StockSectionKey =
  | "telas"
  | "productos"
  | "materiales"
  | "insumos"
  | "disenos_imagenes";

export type StockColorConfig = Record<StockSectionKey, StockThresholds>;

const LS_KEY = "cs_stock_color_config_v1";

const DEFAULT_CONFIG: StockColorConfig = {
  // Puedes ajustar estos defaults cuando quieras.
  telas: { redMax: 5, yellowMax: 15 },
  productos: { ...DEFAULT_STOCK_THRESHOLDS },
  materiales: { ...DEFAULT_STOCK_THRESHOLDS },
  insumos: { ...DEFAULT_STOCK_THRESHOLDS },
  disenos_imagenes: { ...DEFAULT_STOCK_THRESHOLDS },
};

function clampThresholds(t: StockThresholds): StockThresholds {
  const redMax = Math.max(0, Math.floor(Number(t.redMax) || 0));
  const yellowMax = Math.max(redMax, Math.floor(Number(t.yellowMax) || redMax));
  return { redMax, yellowMax };
}

function readConfig(): StockColorConfig {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);

    const cfg: Partial<StockColorConfig> = {};
    (Object.keys(DEFAULT_CONFIG) as StockSectionKey[]).forEach((k) => {
      const t = parsed?.[k];
      if (t && typeof t === "object") cfg[k] = clampThresholds(t);
      else cfg[k] = DEFAULT_CONFIG[k];
    });

    return cfg as StockColorConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function writeConfig(cfg: StockColorConfig) {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

export function useStockConfig() {
  const [config, setConfig] = useState<StockColorConfig>(() => readConfig());

  // Si alguien limpia localStorage mientras está abierta la app.
  useEffect(() => {
    try {
      writeConfig(config);
    } catch {
      // ignore
    }
  }, [config]);

  const setSection = useCallback((key: StockSectionKey, t: StockThresholds) => {
    setConfig((prev) => ({ ...prev, [key]: clampThresholds(t) }));
  }, []);

  const resetSection = useCallback((key: StockSectionKey) => {
    setConfig((prev) => ({ ...prev, [key]: DEFAULT_CONFIG[key] }));
  }, []);

  const labels = useMemo<Record<StockSectionKey, string>>(
    () => ({
      telas: "Telas (mts)",
      productos: "Productos",
      materiales: "Materiales",
      insumos: "Insumos",
      disenos_imagenes: "Diseños (cantidad física)",
    }),
    []
  );

  return { config, setSection, resetSection, labels };
}

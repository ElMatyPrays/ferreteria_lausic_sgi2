export type StockThresholds = {
  /**
   * 1..redMax => rojo (stock-low)
   * 0 o menor => stock-zero
   */
  redMax: number;
  /**
   * (redMax+1)..yellowMax => amarillo (stock-medium)
   * > yellowMax => verde (stock-high)
   */
  yellowMax: number;
};

/**
 * Compatibilidad: umbrales antiguos del proyecto.
 * (0=gris, 1..9=rojo, 10..20=amarillo, >20=verde)
 */
export const DEFAULT_STOCK_THRESHOLDS: StockThresholds = {
  redMax: 9,
  yellowMax: 20,
};

export function getStockClass(cantidad: number, t: StockThresholds = DEFAULT_STOCK_THRESHOLDS): string {
  const n = Number(cantidad);
  if (!Number.isFinite(n) || n <= 0) return "stock-zero";
  if (n <= t.redMax) return "stock-low";
  if (n <= t.yellowMax) return "stock-medium";
  return "stock-high";
}

export type DeadlineThresholds = {
  warningMin: number; // si dias >= warningMin (y <= okMin-1) => amarillo
  okMin: number; // si dias >= okMin => verde
};

export const DEFAULT_DEADLINE_THRESHOLDS: DeadlineThresholds = {
  warningMin: 5,
  okMin: 8,
};

export function getDeadlineClass(dias: number, t: DeadlineThresholds = DEFAULT_DEADLINE_THRESHOLDS): string {
  const n = Number(dias);
  if (!Number.isFinite(n)) return "deadline-zero";
  if (n >= t.okMin) return "deadline-ok";
  if (n >= t.warningMin) return "deadline-warning";
  if (n >= 1) return "deadline-today";
  return "deadline-zero";
}

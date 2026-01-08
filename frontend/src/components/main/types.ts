export const SECTIONS = [
  "Productos",
  "Ventas",
] as const;

export type Section = (typeof SECTIONS)[number];

export type Column = {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";

  /** true = este campo se edita como número en los formularios */
  numeric?: boolean;
};

export type Row = Record<string, any>;

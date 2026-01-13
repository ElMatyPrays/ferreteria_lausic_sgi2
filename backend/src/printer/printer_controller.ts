import { imprimirTicket } from "./printer";

export const printTicket = async (req, res) => {
  try {
    await imprimirTicket(req.body);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Error al imprimir" });
  }
};

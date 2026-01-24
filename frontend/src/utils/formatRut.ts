export function cleanRut(input: string) {
  return String(input || "").replace(/[^0-9kK]/g, "").toUpperCase();
}

export function rutDV(body: string) {
  let sum = 0;
  let mul = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }

  const mod = 11 - (sum % 11);
  if (mod === 11) return "0";
  if (mod === 10) return "K";
  return String(mod);
}

export function formatRut(input: string) {
  // limpia y limita: body max 8, dv 1 => total 9
  const c = cleanRut(input).slice(0, 9);
  if (!c) return "";

  if (c.length === 1) return c; // todavía no hay body + dv

  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  return `${body}-${dv}`;
}

export function isValidRut(input: string) {
  const c = cleanRut(input);
  if (c.length < 8 || c.length > 9) return false; // body 7-8 + dv
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return rutDV(body) === dv;
}

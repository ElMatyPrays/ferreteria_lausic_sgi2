"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularTotales = calcularTotales;
function calcularTotales(totalBruto, conIva, tasaIva = 0.19) {
    if (!conIva) {
        // Si NO aplicas IVA: todo se considera neto, iva=0, total=neto
        const neto = Math.round(totalBruto);
        return { neto, iva: 0, total: neto };
    }
    // Si totalBruto YA incluye IVA: neto = total / 1.19, iva = total - neto
    const total = Math.round(totalBruto);
    const neto = Math.round(total / (1 + tasaIva));
    const iva = total - neto;
    return { neto, iva, total };
}
//# sourceMappingURL=totales.js.map
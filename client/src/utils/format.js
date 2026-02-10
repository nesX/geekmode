/**
 * Formatea un valor numérico a moneda colombiana (COP).
 * Ejemplo: 50000 -> $ 50.000
 *
 * @param {number} amount - El valor a formatear.
 * @returns {string} El valor formateado.
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

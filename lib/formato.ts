// lib/formato.ts
export function formatearMoneda(numero: number | string): string {
  const valor = typeof numero === 'string' ? parseFloat(numero) : numero;
  if (isNaN(valor)) return '$ 0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(valor);
}

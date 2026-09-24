export function formatCurrency(amount: number): string {
  return `S/ ${Number(amount || 0).toFixed(2)}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-PE');
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('es-PE');
}

export function generateTicketNumber(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `B${yyyy}${mm}${dd}-${rand}`;
}

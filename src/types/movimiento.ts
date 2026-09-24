export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface MovimientoStockDB {
  id?: number;
  producto_id: number;
  usuario_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string | null;
  fecha_movimiento?: string | null;
  productos?: { nombre?: string; sku?: string } | null;
  perfiles?: { nombre_completo?: string } | null;
}

import api from './api';
import type { MovimientoStockDB, TipoMovimiento } from '../types/movimiento';

export interface MovementFilters {
  productoId?: number;
  tipo?: string;
  from?: string;
  to?: string;
}

export interface CreateMovementParams {
  productoId: number;
  usuarioId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string | null;
}

export async function getMovements(filtros: MovementFilters = {}): Promise<MovimientoStockDB[]> {
  let url = '/movimientos_stock?select=*,productos(nombre,sku),perfiles(nombre_completo)&order=fecha_movimiento.desc';
  if (filtros.productoId) url += `&producto_id=eq.${filtros.productoId}`;
  if (filtros.tipo)       url += `&tipo=eq.${filtros.tipo}`;
  if (filtros.from)       url += `&fecha_movimiento=gte.${filtros.from}`;
  if (filtros.to)         url += `&fecha_movimiento=lte.${filtros.to}T23:59:59`;

  const { data } = await api.get(url);
  return data || [];
}

export async function createMovement({
  productoId,
  usuarioId,
  tipo,
  cantidad,
  motivo = null,
}: CreateMovementParams): Promise<MovimientoStockDB> {
  const payload = {
    producto_id: productoId,
    usuario_id:  usuarioId,
    tipo,
    cantidad:    Math.abs(cantidad),
    motivo:      motivo ?? null,
  };
  const { data } = await api.post('/movimientos_stock', payload);
  return data[0];
}

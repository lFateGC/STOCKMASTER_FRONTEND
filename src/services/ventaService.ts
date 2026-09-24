import api from './api';
import type { VentaDB, DetalleVentaDB, MetodoPagoDB } from '../types/venta';
import { generateTicketNumber } from '../utils/formatters';
import { IGV_RATE } from '../utils/constants';

export interface SalesFilters {
  from?: string;
  to?: string;
  vendedorId?: string;
}

export interface SaleItemInput {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface CreateSaleParams {
  vendedorId: string;
  cliente: string;
  metodoPagoId?: number | null;
  descuento?: number;
  observaciones?: string | null;
  items: SaleItemInput[];
}

export function calcularTotalesVenta(
  items: Array<{ precioUnitario: number; cantidad: number }>,
  descuento: number = 0
): { subtotal: number; igv: number; total: number } {
  const base = items.reduce((a, i) => a + i.precioUnitario * i.cantidad, 0);
  const subtotal = +(base - Number(descuento)).toFixed(2);
  const igv = +(subtotal * IGV_RATE).toFixed(2);
  const total = +(subtotal + igv).toFixed(2);
  return { subtotal, igv, total };
}

export async function getPaymentMethods(): Promise<MetodoPagoDB[]> {
  const { data } = await api.get('/metodos_pago?order=nombre&select=*');
  return data || [];
}

export async function getSales(filtros: SalesFilters = {}): Promise<VentaDB[]> {
  let url = '/ventas?select=*,perfiles(nombre_completo),metodos_pago(nombre)&order=fecha_venta.desc';
  if (filtros.vendedorId) url += `&vendedor_id=eq.${filtros.vendedorId}`;
  if (filtros.from)       url += `&fecha_venta=gte.${filtros.from}`;
  if (filtros.to)         url += `&fecha_venta=lte.${filtros.to}T23:59:59`;

  const { data } = await api.get(url);
  return data || [];
}

export async function getSaleDetail(ventaId: number): Promise<DetalleVentaDB[]> {
  const { data } = await api.get(
    `/detalle_ventas?venta_id=eq.${ventaId}&select=*,productos(nombre,sku)`
  );
  return data || [];
}

export async function createSale({
  vendedorId,
  cliente,
  metodoPagoId = null,
  descuento = 0,
  observaciones = null,
  items,
}: CreateSaleParams): Promise<{ venta: VentaDB; detalles: DetalleVentaDB[] }> {
  const { subtotal, igv, total } = calcularTotalesVenta(items, descuento);

  const { data: ventaRows } = await api.post('/ventas', {
    numero_boleta:  generateTicketNumber(),
    vendedor_id:    vendedorId,
    cliente,
    metodo_pago_id: metodoPagoId ?? null,
    subtotal,
    igv,
    descuento:      Number(descuento),
    total,
    estado:         'completada',
    observaciones:  observaciones ?? null,
  });
  const venta = ventaRows[0];

  const detallePayload = items.map(i => ({
    venta_id:        venta.id,
    producto_id:     i.productoId,
    cantidad:        i.cantidad,
    precio_unitario: i.precioUnitario,
    subtotal:        +(i.cantidad * i.precioUnitario).toFixed(2),
  }));

  const { data: detalleRows } = await api.post('/detalle_ventas', detallePayload);

  return { venta, detalles: detalleRows || [] };
}

export const cancelSale = (ventaId: number) =>
  api.patch(`/ventas?id=eq.${ventaId}`, { estado: 'anulada' });

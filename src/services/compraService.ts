import api from './api';
import type { CompraDB, DetalleCompraDB, ProveedorDB } from '../types/compra';
import { IGV_RATE } from '../utils/constants';

export interface PurchaseFilters {
  from?: string;
  to?: string;
  proveedorId?: number;
}

export interface PurchaseItemInput {
  productoId: number;
  cantidad: number;
  costoUnitario: number;
}

export interface CreatePurchaseParams {
  proveedorId: number;
  usuarioId: string;
  items: PurchaseItemInput[];
}

export interface SupplierPayload {
  razonSocial: string;
  ruc?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
}

export function calcularTotalesCompra(items: Array<{ costoUnitario: number; cantidad: number }>): {
  subtotal: number;
  igv: number;
  total: number;
} {
  const subtotal = +(items.reduce((a, i) => a + i.costoUnitario * i.cantidad, 0)).toFixed(2);
  const igv = +(subtotal * IGV_RATE).toFixed(2);
  const total = +(subtotal + igv).toFixed(2);
  return { subtotal, igv, total };
}

// ── Compras ──────────────────────────────────────────────

export async function getPurchases(filtros: PurchaseFilters = {}): Promise<CompraDB[]> {
  let url = '/compras?select=*,proveedores(razon_social,ruc),perfiles(nombre_completo)&order=fecha_compra.desc';
  if (filtros.proveedorId) url += `&proveedor_id=eq.${filtros.proveedorId}`;
  if (filtros.from)        url += `&fecha_compra=gte.${filtros.from}`;
  if (filtros.to)          url += `&fecha_compra=lte.${filtros.to}T23:59:59`;

  const { data } = await api.get(url);
  return data || [];
}

export async function getPurchaseDetail(compraId: number): Promise<DetalleCompraDB[]> {
  const { data } = await api.get(
    `/detalle_compras?compra_id=eq.${compraId}&select=*,productos(nombre,sku)`
  );
  return data || [];
}

export async function createPurchase({
  proveedorId,
  usuarioId,
  items,
}: CreatePurchaseParams): Promise<{ compra: CompraDB; detalles: DetalleCompraDB[] }> {
  const { subtotal, igv, total } = calcularTotalesCompra(items);

  const { data: compraRows } = await api.post('/compras', {
    proveedor_id: proveedorId,
    usuario_id:   usuarioId,
    subtotal,
    igv,
    total,
  });
  const compra = compraRows[0];

  const detallePayload = items.map(i => ({
    compra_id:      compra.id,
    producto_id:    i.productoId,
    cantidad:       i.cantidad,
    costo_unitario: i.costoUnitario,
    subtotal:       +(i.cantidad * i.costoUnitario).toFixed(2),
  }));

  const { data: detalleRows } = await api.post('/detalle_compras', detallePayload);

  return { compra, detalles: detalleRows || [] };
}

// ── Proveedores ──────────────────────────────────────────

export async function getSuppliers(): Promise<ProveedorDB[]> {
  const { data } = await api.get('/proveedores?order=razon_social&select=*');
  return data || [];
}

export async function createSupplier({
  razonSocial,
  ruc = null,
  telefono = null,
  correo = null,
  direccion = null,
}: SupplierPayload): Promise<ProveedorDB> {
  const { data } = await api.post('/proveedores', {
    razon_social: razonSocial,
    ruc,
    telefono,
    correo,
    direccion,
  });
  return data[0];
}

export async function updateSupplier(
  id: number,
  {
    razonSocial,
    ruc = null,
    telefono = null,
    correo = null,
    direccion = null,
  }: SupplierPayload
): Promise<ProveedorDB> {
  const { data } = await api.patch(`/proveedores?id=eq.${id}`, {
    razon_social: razonSocial,
    ruc,
    telefono,
    correo,
    direccion,
  });
  return data[0];
}

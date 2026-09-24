import api from './api';
import type { CompraDB, ProveedorDB, DetalleCompraDB } from '../types/compra';
import { IGV_RATE } from '../utils/constants';

function normalizeCompra(c: any): CompraDB {
  if (!c) return c;
  const fecha = c.fechaCompra ?? c.fecha_compra ?? c.date;
  return {
    ...c,
    id: c.id,
    proveedorId: c.proveedorId ?? c.proveedor_id,
    proveedor_id: c.proveedorId ?? c.proveedor_id,
    proveedorNombre: c.proveedorNombre ?? c.proveedor_nombre ?? c.supplier,
    proveedor_nombre: c.proveedorNombre ?? c.proveedor_nombre ?? c.supplier,
    usuarioId: c.usuarioId ?? c.usuario_id,
    usuario_id: c.usuarioId ?? c.usuario_id,
    usuarioNombre: c.usuarioNombre ?? c.usuario_nombre ?? c.createdBy,
    usuario_nombre: c.usuarioNombre ?? c.usuario_nombre ?? c.createdBy,
    subtotal: Number(c.subtotal || 0),
    igv: Number(c.igv || 0),
    total: Number(c.total || 0),
    fechaCompra: fecha,
    fecha_compra: fecha,
    detalles: (c.detalles || []).map((d: any) => ({
      ...d,
      id: d.id,
      compraId: d.compraId ?? d.compra_id,
      compra_id: d.compraId ?? d.compra_id,
      productoId: d.productoId ?? d.producto_id,
      producto_id: d.productoId ?? d.producto_id,
      productoNombre: d.productoNombre ?? d.producto_nombre ?? d.productName,
      producto_nombre: d.productoNombre ?? d.producto_nombre ?? d.productName,
      sku: d.sku,
      cantidad: d.cantidad,
      costoUnitario: Number(d.costoUnitario ?? d.costo_unitario ?? d.unitCost ?? 0),
      costo_unitario: Number(d.costoUnitario ?? d.costo_unitario ?? d.unitCost ?? 0),
      subtotal: Number(d.subtotal || 0),
    })),
  };
}

function normalizeSupplier(s: any): ProveedorDB {
  if (!s) return s;
  const razon = s.razonSocial ?? s.razon_social ?? s.nombre ?? '';
  return {
    ...s,
    id: s.id,
    razonSocial: razon,
    razon_social: razon,
    nombre: razon,
    ruc: s.ruc || null,
    telefono: s.telefono || null,
    correo: s.correo || null,
    direccion: s.direccion || null,
    fechaCreacion: s.fechaCreacion ?? s.fecha_creacion ?? null,
    fecha_creacion: s.fechaCreacion ?? s.fecha_creacion ?? null,
  };
}

export function calcularTotalesCompra(
  items: { costoUnitario: number; cantidad: number }[]
): { subtotal: number; igv: number; total: number } {
  const subtotal = items.reduce((acc, i) => acc + i.costoUnitario * i.cantidad, 0);
  const igv = subtotal * IGV_RATE;
  const total = subtotal + igv;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    igv: Math.round(igv * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export async function getPurchases(): Promise<CompraDB[]> {
  const { data } = await api.get('/compras');
  return (data || []).map(normalizeCompra);
}

export async function getPurchaseById(id: number): Promise<CompraDB> {
  const { data } = await api.get(`/compras/${id}`);
  return normalizeCompra(data);
}

export async function getPurchaseDetail(compraId: number): Promise<DetalleCompraDB[]> {
  const compra = await getPurchaseById(compraId);
  return compra.detalles || [];
}

export async function createPurchase(params: {
  proveedorId: number;
  usuarioId?: number | string;
  items: { productoId: number; cantidad: number; costoUnitario: number }[];
}): Promise<{ compra: CompraDB }> {
  const payload = {
    proveedorId: params.proveedorId,
    items: params.items.map(i => ({
      productoId: i.productoId,
      cantidad: i.cantidad,
      costoUnitario: i.costoUnitario,
    })),
  };

  const { data } = await api.post('/compras', payload);
  return { compra: normalizeCompra(data) };
}

// ── Proveedores ─────────────────────────────────────────

export async function getSuppliers(): Promise<ProveedorDB[]> {
  const { data } = await api.get('/proveedores');
  return (data || []).map(normalizeSupplier);
}

export async function createSupplier(proveedor: {
  razonSocial: string;
  ruc?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
}): Promise<ProveedorDB> {
  const payload = {
    razonSocial: proveedor.razonSocial,
    ruc: proveedor.ruc || null,
    telefono: proveedor.telefono || null,
    correo: proveedor.correo || null,
    direccion: proveedor.direccion || null,
  };
  const { data } = await api.post('/proveedores', payload);
  return normalizeSupplier(data);
}

export async function updateSupplier(id: number, proveedor: Partial<ProveedorDB>): Promise<ProveedorDB> {
  const payload = {
    razonSocial: proveedor.razonSocial ?? proveedor.razon_social ?? proveedor.nombre,
    ruc: proveedor.ruc,
    telefono: proveedor.telefono,
    correo: proveedor.correo,
    direccion: proveedor.direccion,
  };
  const { data } = await api.put(`/proveedores/${id}`, payload);
  return normalizeSupplier(data);
}

export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`/proveedores/${id}`);
}

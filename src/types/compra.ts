export interface ProveedorDB {
  id?: number;
  razon_social: string;
  ruc?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  fecha_creacion?: string | null;
}

export interface CompraDB {
  id?: number;
  proveedor_id: number;
  usuario_id: string;
  subtotal: number;
  igv: number;
  total: number;
  fecha_compra?: string | null;
  proveedores?: { razon_social?: string; ruc?: string } | null;
  perfiles?: { nombre_completo?: string } | null;
}

export interface DetalleCompraDB {
  id?: number | null;
  compra_id?: number | null;
  producto_id: number;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
  productos?: { nombre?: string; sku?: string } | null;
}

export interface CarritoCompraItem {
  productoId: number;
  productoNombre: string;
  sku?: string | null;
  costoUnitario: number;
  cantidad: number;
}

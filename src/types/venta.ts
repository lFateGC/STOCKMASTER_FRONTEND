export interface MetodoPagoDB {
  id?: number;
  nombre: string;
}

export interface VentaDB {
  id?: number;
  numero_boleta: string;
  vendedor_id: string;
  cliente: string;
  metodo_pago_id?: number | null;
  subtotal: number;
  igv: number;
  descuento?: number;
  total: number;
  estado?: 'completada' | 'anulada' | string;
  fecha_venta?: string | null;
  observaciones?: string | null;
  perfiles?: { nombre_completo?: string } | null;
  metodos_pago?: { nombre?: string } | null;
}

export interface DetalleVentaDB {
  id?: number | null;
  venta_id?: number | null;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  productos?: { nombre?: string } | null;
}

export interface CarritoVentaItem {
  productoId: number;
  productoNombre: string;
  sku?: string | null;
  precioUnitario: number;
  cantidad: number;
  stockMax: number;
}

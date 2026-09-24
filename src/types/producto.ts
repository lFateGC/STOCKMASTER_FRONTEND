export interface CategoriaDB {
  id?: number;
  nombre: string;
  descripcion?: string | null;
  fecha_creacion?: string | null;
}

export interface ProductoDB {
  id?: number;
  categoria_id?: number | null;
  sku?: string | null;
  nombre: string;
  descripcion?: string | null;
  precio_compra?: number | string | null;
  precio_venta?: number | string | null;
  stock?: number | string | null;
  stock_minimo?: number | string | null;
  estado?: string;
  imagen_url?: string | null;
  imagenUrl?: string | null;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
  categorias?: { id?: number; nombre?: string } | null;
}

export interface ProductoItem {
  id: number;
  categoriaId: number | null;
  sku: string | null;
  nombre: string;
  descripcion: string | null;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  estado: string;
  imagenUrl: string | null;
  fechaCreacion: Date | null;
  fechaActualizacion: Date | null;
  categoriaNombre: string | null;
}

import api from './api';
import type { ProductoDB, CategoriaDB } from '../types/producto';

const PRODUCTO_SELECT = '*,categorias(id,nombre)';

export async function getProducts(): Promise<ProductoDB[]> {
  const { data } = await api.get(`/productos?select=${PRODUCTO_SELECT}&estado=eq.activo&order=id`);
  return data || [];
}

export async function getAllProducts(): Promise<ProductoDB[]> {
  const { data } = await api.get(`/productos?select=${PRODUCTO_SELECT}&order=id`);
  return data || [];
}

export async function getProductById(id: number): Promise<ProductoDB> {
  const { data } = await api.get(`/productos?select=${PRODUCTO_SELECT}&id=eq.${id}&limit=1`);
  if (!data?.length) throw new Error('Producto no encontrado.');
  return data[0];
}

export async function createProduct(producto: Partial<ProductoDB>): Promise<ProductoDB> {
  const { data } = await api.post('/productos', producto);
  return data[0];
}

export async function updateProduct(id: number, campos: Partial<ProductoDB>): Promise<ProductoDB> {
  const payload = {
    ...campos,
    fecha_actualizacion: new Date().toISOString(),
  };
  const { data } = await api.patch(`/productos?id=eq.${id}`, payload);
  return data[0];
}

export async function deleteProduct(id: number): Promise<void> {
  await api.patch(`/productos?id=eq.${id}`, {
    estado: 'inactivo',
    fecha_actualizacion: new Date().toISOString(),
  });
}

// ── Categorías ──────────────────────────────────────────

export async function getCategories(): Promise<CategoriaDB[]> {
  const { data } = await api.get('/categorias?order=nombre&select=*');
  return data || [];
}

export async function createCategory(nombre: string, descripcion: string | null = null): Promise<CategoriaDB> {
  const { data } = await api.post('/categorias', { nombre, descripcion });
  return data[0];
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categorias?id=eq.${id}`);
}

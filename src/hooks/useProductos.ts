import { useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories } from '../services/productoService';
import type { ProductoDB, CategoriaDB } from '../types/producto';

export function useProductos() {
  const [productos, setProductos]   = useState<ProductoDB[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDB[]>([]);
  const [loading, setLoading]       = useState<boolean>(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProductos(prods);
      setCategorias(cats);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { productos, categorias, loading, error, refetch: fetchData, setProductos };
}

export default useProductos;

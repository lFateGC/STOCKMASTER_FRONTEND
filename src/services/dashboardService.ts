import api from './api';

export interface DashboardStats {
  totalProductos: number;
  productosBajoStock: number;
  productosSinStock: number;
  totalVentas: number;
  totalIngresos: number;
  totalCompras: number;
  totalEgresos: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/dashboard/stats');
  return {
    totalProductos: Number(data.totalProductos || 0),
    productosBajoStock: Number(data.productosBajoStock || 0),
    productosSinStock: Number(data.productosSinStock || 0),
    totalVentas: Number(data.totalVentas || 0),
    totalIngresos: Number(data.totalIngresos || 0),
    totalCompras: Number(data.totalCompras || 0),
    totalEgresos: Number(data.totalEgresos || 0),
  };
}

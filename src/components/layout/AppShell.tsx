import { useState, useEffect, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { getProducts } from '../../services/productoService';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  useEffect(() => {
    getProducts()
      .then(products => {
        const count = products.filter(
          p => Number(p.stock ?? 0) <= Number(p.stock_minimo ?? 5)
        ).length;
        setLowStockCount(count);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="container-fluid p-0">
      <div className="row g-0" style={{ minHeight: '100vh' }}>
        <div className="col-auto">
          <Sidebar lowStockCount={lowStockCount} />
        </div>
        <div className="col" style={{ minWidth: 0 }}>
          <Navbar lowStockCount={lowStockCount} />
          <main className="p-3 p-md-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

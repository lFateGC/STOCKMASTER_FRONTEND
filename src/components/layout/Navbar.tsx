import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PageInfo {
  title: string;
  sub: string;
}

const TITLES: Record<string, PageInfo> = {
  '/':            { title: 'Panel de Control',       sub: 'Resumen consolidado de operaciones'   },
  '/dashboard':   { title: 'Panel de Control',       sub: 'Resumen consolidado de operaciones'   },
  '/productos':   { title: 'Catálogo de Productos',  sub: 'Inventario, listas de precios y stock' },
  '/categorias':  { title: 'Gestión de Categorías',  sub: 'Clasificación y taxonomía de productos' },
  '/ventas':      { title: 'Punto de Venta',         sub: 'Emisión de comprobantes y facturación' },
  '/compras':     { title: 'Órdenes de Compra',      sub: 'Gestión de proveedores y abastecimiento' },
  '/movimientos': { title: 'Kardex de Inventario',   sub: 'Trazabilidad y auditoría de existencias' },
  '/usuarios':    { title: 'Control de Usuarios',    sub: 'Gestión de accesos, credenciales y roles' },
};

interface NavbarProps {
  lowStockCount?: number;
}

export default function Navbar({ lowStockCount = 0 }: NavbarProps) {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const page = TITLES[pathname] || { title: 'StockMaster', sub: '' };

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-2 px-4 shadow-sm">
      <div>
        <h1 className="h5 mb-0 fw-bold text-dark">{page.title}</h1>
        <p className="text-muted small mb-0">{page.sub}</p>
      </div>
      <div className="ms-auto d-flex align-items-center gap-2">
        {lowStockCount > 0 && (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
            Alerta: {lowStockCount} ítems con stock crítico
          </span>
        )}
        <span className={`badge ${isAdmin() ? 'bg-primary' : 'bg-secondary'} px-3 py-1`}>
          {isAdmin() ? 'Administrador' : 'Operador'}
        </span>
      </div>
    </header>
  );
}

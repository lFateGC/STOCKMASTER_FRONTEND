import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/authService';

interface NavItem {
  to: string;
  label: string;
}

const GENERAL_NAV: NavItem[] = [
  { to: '/',            label: 'Dashboard' },
  { to: '/productos',   label: 'Productos' },
  { to: '/ventas',      label: 'Ventas' },
  { to: '/movimientos', label: 'Movimientos' },
];

const ADMIN_NAV: NavItem[] = [
  { to: '/compras',     label: 'Compras' },
  { to: '/categorias',  label: 'Categorías' },
  { to: '/usuarios',    label: 'Usuarios' },
];

interface SidebarProps {
  lowStockCount?: number;
}

export default function Sidebar({ lowStockCount = 0 }: SidebarProps) {
  const { session, setSession, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setSession(null);
    navigate('/login');
  };

  const initial = session?.displayName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <aside className="bg-white border-end vh-100 p-3 d-flex flex-column" style={{ width: 240 }}>
      {/* Brand Header */}
      <div className="d-flex align-items-center gap-2 mb-4 px-2 pt-2">
        <div
          className="rounded bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 32, height: 32, fontSize: 16 }}
        >
          S
        </div>
        <div>
          <div className="h6 mb-0 fw-bold text-dark tracking-tight">StockMaster</div>
          <div className="text-muted" style={{ fontSize: '.7rem', letterSpacing: '.05em' }}>
            ENTERPRISE ERP
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="d-flex align-items-center mb-4 p-2 bg-light rounded border">
        <div
          className="rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
          style={{ width: 34, height: 34, fontSize: 13 }}
        >
          {initial}
        </div>
        <div className="overflow-hidden ms-2">
          <div className="fw-semibold text-truncate small text-dark">
            {session?.displayName || session?.username}
          </div>
          <div className="text-muted" style={{ fontSize: '.72rem' }}>
            {isAdmin() ? 'Administrador' : 'Vendedor'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav flex-column flex-grow-1">
        <div className="small text-uppercase text-muted px-2 mb-1 fw-bold" style={{ fontSize: '.68rem', letterSpacing: '.06em' }}>
          Operaciones
        </div>
        {GENERAL_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center justify-content-between py-2 px-3 rounded mb-1 ${
                isActive ? ' active bg-primary text-white fw-semibold' : ' text-secondary'
              }`
            }
          >
            <span style={{ fontSize: '.88rem' }}>{item.label}</span>
            {item.to === '/productos' && lowStockCount > 0 && (
              <span className="badge bg-danger rounded-pill px-2">{lowStockCount}</span>
            )}
          </NavLink>
        ))}

        {isAdmin() && (
          <>
            <div
              className="small text-uppercase text-muted px-2 mt-3 mb-1 fw-bold"
              style={{ fontSize: '.68rem', letterSpacing: '.06em' }}
            >
              Administración
            </div>
            {ADMIN_NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center py-2 px-3 rounded mb-1 ${
                    isActive ? ' active bg-primary text-white fw-semibold' : ' text-secondary'
                  }`
                }
              >
                <span style={{ fontSize: '.88rem' }}>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        <div className="flex-grow-1" />

        <button
          type="button"
          className="btn btn-outline-danger w-100 text-center btn-sm py-2 mb-2"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </nav>

      <div className="pt-2 border-top text-muted d-flex align-items-center justify-content-between" style={{ fontSize: '.72rem' }}>
        <span className="d-flex align-items-center gap-1">
          <span className="rounded-circle bg-success d-inline-block" style={{ width: 6, height: 6 }} />
          En línea
        </span>
        <span className="text-secondary">v1.0.0</span>
      </div>
    </aside>
  );
}

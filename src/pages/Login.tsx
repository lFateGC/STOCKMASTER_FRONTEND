import { useState, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }
    setLoading(true);
    setError('');

    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success || !result.session) {
      setError(result.error || 'Credenciales de acceso no válidas.');
      emailRef.current?.focus();
      return;
    }

    setSession(result.session);
    navigate('/');
  };

  return (
    <div className="container-fluid p-0 min-vh-100 d-flex flex-column flex-lg-row" style={{ backgroundColor: '#f8fafc' }}>
      {/* Panel Izquierdo: Presentación Institucional y Valor del ERP (visible en desktop) */}
      <div
        className="d-none d-lg-flex col-lg-6 col-xl-7 flex-column justify-content-between p-5 text-white position-relative"
        style={{
          background: 'linear-gradient(140deg, #090e17 0%, #0f172a 50%, #1e293b 100%)',
          borderRight: '1px solid #334155',
        }}
      >
        <div>
          {/* Logo y Marca */}
          <div className="d-flex align-items-center gap-3 mb-5">
            <svg width="42" height="42" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="#2563eb" />
              <path d="M20 9L29 14.2V25.8L20 31L11 25.8V14.2L20 9Z" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round" />
              <path d="M20 9V20M20 20L29 14.2M20 20L11 14.2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 20V31" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <div className="h4 mb-0 fw-bold tracking-tight text-white">StockMaster</div>
              <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-25 py-1 px-2 fw-medium" style={{ fontSize: '.7rem', letterSpacing: '.05em' }}>
                SISTEMA ERP &bull; ALMACÉN &bull; POS
              </span>
            </div>
          </div>

          {/* Mensaje de propuesta */}
          <div className="mt-5 pt-3" style={{ maxWidth: 540 }}>
            <h1 className="display-6 fw-bold text-white mb-3" style={{ lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              Gestión centralizada de existencias, ventas y abastecimiento.
            </h1>
            <p className="lead text-slate-300 fs-6 mb-4" style={{ color: '#94a3b8', lineHeight: 1.6 }}>
              Plataforma empresarial de control de inventario con kardex valorizado, punto de venta transaccional y auditoría integral de operaciones.
            </p>

            {/* Capacidades clave */}
            <div className="d-flex flex-column gap-3 mt-4 pt-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="small text-light">Supervisión de stock en tiempo real y alertas de reposición</span>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="small text-light">Punto de Venta (POS) con cálculo tributario automático (IGV)</span>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="small text-light">Auditoría de compras por proveedor y trazabilidad de movimientos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del panel izquierdo */}
        <div className="pt-4 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between text-muted small" style={{ color: '#64748b' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="d-inline-block rounded-circle bg-success" style={{ width: 8, height: 8 }}></span>
            <span>Servicios de backend operativos</span>
          </div>
          <span>Versión 1.0.0</span>
        </div>
      </div>

      {/* Panel Derecho: Formulario de Acceso Limpio y Legible */}
      <div className="col-12 col-lg-6 col-xl-5 d-flex align-items-center justify-content-center p-4 p-md-5">
        <div style={{ maxWidth: 420, width: '100%' }}>
          {/* Cabecera para dispositivos móviles */}
          <div className="d-flex d-lg-none align-items-center gap-3 mb-4">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="#2563eb" />
              <path d="M20 9L29 14.2V25.8L20 31L11 25.8V14.2L20 9Z" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round" />
              <path d="M20 9V20M20 20L29 14.2M20 20L11 14.2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 20V31" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <div className="h5 mb-0 fw-bold text-dark">StockMaster</div>
              <small className="text-muted">Plataforma de Gestión</small>
            </div>
          </div>

          {/* Títulos del Formulario */}
          <div className="mb-4">
            <h2 className="h4 fw-bold text-dark mb-2" style={{ letterSpacing: '-0.01em' }}>Iniciar Sesión</h2>
            <p className="text-muted small mb-0">
              Ingresa tus credenciales autorizadas para acceder al sistema.
            </p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <div>{error}</div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Correo Electrónico
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  ref={emailRef}
                  type="email"
                  className="form-control border-start-0 ps-1"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  required
                  style={{ height: 44, fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-secondary mb-0">
                  Contraseña
                </label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-1"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  style={{ height: 44, fontSize: '0.92rem' }}
                />
                <button
                  type="button"
                  className="input-group-text bg-white border-start-0 text-muted"
                  onClick={() => setShowPass(v => !v)}
                  title={showPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                  style={{ cursor: 'pointer' }}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              disabled={loading}
              style={{ height: 44, fontSize: '0.95rem' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <span>Ingresar al Panel</span>
              )}
            </button>
          </form>

          {/* Información de Seguridad Corporativa */}
          <div className="mt-4 pt-3 border-top text-center text-muted" style={{ fontSize: '.78rem' }}>
            <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Acceso seguro cifrado de nivel empresarial</span>
            </div>
            <span>StockMaster &copy; {new Date().getFullYear()} &bull; Todos los derechos reservados</span>
          </div>
        </div>
      </div>
    </div>
  );
}

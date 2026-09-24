import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const url = import.meta.env.VITE_SUPABASE_URL || 'https://wgxyrjavgwzebjvajqes.supabase.co';
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        const response = await fetch(`${url}/auth/v1/health`, {
          method: 'GET',
          headers: { apikey: key },
        });
        setConnectionError(!response.ok);
      } catch {
        setConnectionError(true);
      }
    };
    checkConnection();
  }, []);

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
    <div className="d-flex align-items-center justify-content-center min-vh-100 py-4 bg-slate-900" style={{ backgroundColor: '#0f172a' }}>
      <div className="card p-4 shadow-lg border-0" style={{ maxWidth: 420, width: '100%', backgroundColor: '#1e293b', color: '#f8fafc' }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div
            className="rounded bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: 36, height: 36, fontSize: 18 }}
          >
            S
          </div>
          <div>
            <div className="h5 mb-0 fw-bold text-white">StockMaster</div>
            <div className="text-secondary small" style={{ fontSize: '.72rem', letterSpacing: '.05em' }}>
              PLATAFORMA DE GESTIÓN EMPRESARIAL
            </div>
          </div>
        </div>

        <h2 className="h5 mb-1 text-white fw-semibold">Iniciar Sesión</h2>
        <p className="text-muted mb-4 small">Ingrese sus credenciales corporativas para continuar</p>

        {connectionError && (
          <div className="alert alert-warning py-2 small" role="alert">
            Aviso: Verificando la conectividad con el servidor de autenticación...
          </div>
        )}

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold text-uppercase" style={{ fontSize: '.75rem' }}>
              Correo electrónico
            </label>
            <input
              ref={emailRef}
              type="email"
              className="form-control"
              style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@empresa.com"
              autoComplete="email"
              autoFocus
              disabled={loading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small fw-semibold text-uppercase" style={{ fontSize: '.75rem' }}>
              Contraseña
            </label>
            <div className="input-group">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                style={{ borderColor: '#334155', color: '#94a3b8' }}
                onClick={() => setShowPass(v => !v)}
                disabled={loading}
              >
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? 'Autenticando...' : 'Acceder al Sistema'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top border-secondary text-center small text-muted">
          StockMaster &copy; 2026 &bull; Todos los derechos reservados
        </div>
      </div>
    </div>
  );
}

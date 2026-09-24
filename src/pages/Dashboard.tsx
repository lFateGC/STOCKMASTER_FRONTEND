import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProducts } from '../services/productoService';
import { getSales } from '../services/ventaService';
import type { ProductoDB } from '../types/producto';
import type { VentaDB } from '../types/venta';
import Loader from '../components/feedback/Loader';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function Dashboard() {
  const { session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductoDB[]>([]);
  const [sales, setSales]       = useState<VentaDB[]>([]);
  const [loading, setLoading]   = useState<boolean>(true);

  useEffect(() => {
    Promise.all([getProducts(), getSales()])
      .then(([p, s]) => {
        setProducts(p);
        setSales(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const today = new Date().toISOString().slice(0, 10);
  const ventasHoy = sales.filter(s => s.fecha_venta && s.fecha_venta.slice(0, 10) === today);
  const ingresoHoy = ventasHoy.reduce((a, s) => a + Number(s.total || 0), 0);
  const totalIngr  = sales.reduce((a, s) => a + Number(s.total || 0), 0);
  const totalIGV   = sales.reduce((a, s) => a + Number(s.igv || 0), 0);

  const lowStock = products.filter(p => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= Number(p.stock_minimo || 5));
  const outStock = products.filter(p => Number(p.stock || 0) === 0);

  const kpis = [
    { label: 'Facturación del Día', value: formatCurrency(ingresoHoy), meta: `${ventasHoy.length} transacciones registradas` },
    { label: 'Total de Ventas',     value: String(sales.length),       meta: 'Comprobantes emitidos' },
    { label: 'Catálogo de Bienes',  value: String(products.length),    meta: 'Productos registrados' },
    {
      label: 'Alertas de Stock',
      value: String(outStock.length + lowStock.length),
      meta: outStock.length > 0 ? `${outStock.length} sin existencias` : 'Nivel aceptable',
      danger: outStock.length > 0,
      warning: lowStock.length > 0 && outStock.length === 0,
    },
    ...(isAdmin() ? [
      { label: 'Ingresos Históricos', value: formatCurrency(totalIngr), meta: 'Monto bruto consolidado' },
      { label: 'IGV Recaudado',       value: formatCurrency(totalIGV),  meta: '18% tributario acumulado' },
    ] : []),
  ];

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h4 mb-0 fw-semibold text-dark">Panel de Control General</h1>
          <p className="text-muted mb-0 small">
            Usuario activo: {session?.displayName || session?.username} &bull; {isAdmin() ? 'Rol Administrador' : 'Rol Operador'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {kpis.map((k, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className={`card p-3 h-100 shadow-sm border-0 ${k.danger ? 'border-start border-4 border-danger' : k.warning ? 'border-start border-4 border-warning' : 'border-start border-4 border-primary'}`}>
              <div className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '.7rem', letterSpacing: '.04em' }}>
                {k.label}
              </div>
              <div className="h5 mb-1 mt-2 fw-bold text-dark">{k.value}</div>
              <div className="text-secondary" style={{ fontSize: '.72rem' }}>{k.meta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Alertas de inventario */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
              <span className="fw-semibold text-secondary small text-uppercase">Novedades de Inventario</span>
              {(outStock.length > 0 || lowStock.length > 0) && (
                <button type="button" className="btn btn-sm btn-outline-secondary py-1 px-2" onClick={() => navigate('/productos')}>
                  Ver inventario
                </button>
              )}
            </div>
            <div className="card-body">
              {outStock.length === 0 && lowStock.length === 0 ? (
                <div className="text-success d-flex align-items-center gap-2 py-4">
                  <span className="small">Todos los productos cuentan con niveles de stock óptimos.</span>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {outStock.map(p => (
                    <div key={p.id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                      <span className="fw-semibold small text-dark">{p.nombre}</span>
                      <span className="badge bg-danger">Agotado</span>
                    </div>
                  ))}
                  {lowStock.map(p => (
                    <div key={p.id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                      <span className="small text-dark">{p.nombre}</span>
                      <span className="badge bg-warning text-dark">{p.stock} unidades (Crítico)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white fw-semibold py-3 border-bottom text-secondary small text-uppercase">
              Módulos Principales
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <button type="button" className="btn btn-primary w-100 py-2 text-center" onClick={() => navigate('/ventas')}>
                    Nueva Venta
                  </button>
                </div>
                <div className="col-6">
                  <button type="button" className="btn btn-outline-secondary w-100 py-2 text-center" onClick={() => navigate('/productos')}>
                    Catálogo de Productos
                  </button>
                </div>
                <div className="col-6">
                  <button type="button" className="btn btn-outline-secondary w-100 py-2 text-center" onClick={() => navigate('/movimientos')}>
                    Kardex de Movimientos
                  </button>
                </div>
                {isAdmin() && (
                  <div className="col-6">
                    <button type="button" className="btn btn-outline-secondary w-100 py-2 text-center" onClick={() => navigate('/compras')}>
                      Órdenes de Compra
                    </button>
                  </div>
                )}
                {isAdmin() && (
                  <div className="col-6">
                    <button type="button" className="btn btn-outline-secondary w-100 py-2 text-center" onClick={() => navigate('/categorias')}>
                      Clasificación de Categorías
                    </button>
                  </div>
                )}
                {isAdmin() && (
                  <div className="col-6">
                    <button type="button" className="btn btn-outline-secondary w-100 py-2 text-center" onClick={() => navigate('/usuarios')}>
                      Administración de Usuarios
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registro de transacciones */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <span className="fw-semibold text-secondary small text-uppercase">Últimas Transacciones Registradas</span>
          <button type="button" className="btn btn-sm btn-link text-decoration-none text-muted p-0" onClick={() => navigate('/ventas')}>
            Ver historial completo &rarr;
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 140 }}>Nº Comprobante</th>
                <th>Cliente</th>
                <th className="text-end">Subtotal</th>
                <th className="text-end">IGV (18%)</th>
                <th className="text-end">Total Liquidado</th>
                <th style={{ width: 120 }}>Estado</th>
                <th style={{ width: 170 }}>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 8).map(s => (
                <tr key={s.id}>
                  <td className="text-muted small font-monospace">{s.numero_boleta}</td>
                  <td className="fw-semibold small text-dark">{s.cliente}</td>
                  <td className="text-muted small text-end">{formatCurrency(Number(s.subtotal || 0))}</td>
                  <td className="text-muted small text-end">{formatCurrency(Number(s.igv || 0))}</td>
                  <td className="text-end fw-semibold text-primary small">{formatCurrency(Number(s.total || 0))}</td>
                  <td>
                    <span className={`badge ${s.estado === 'completada' ? 'bg-success' : 'bg-danger'}`}>
                      {s.estado === 'completada' ? 'Completada' : 'Anulada'}
                    </span>
                  </td>
                  <td className="text-muted small">{formatDateTime(s.fecha_venta)}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4 small">
                    No se registran transacciones en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

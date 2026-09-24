import { useState, useEffect, type FormEvent } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/productoService';
import type { CategoriaDB } from '../types/producto';
import Loader from '../components/feedback/Loader';
import { formatDate } from '../utils/formatters';

export default function Categorias() {
  const [categories, setCategories]     = useState<CategoriaDB[]>([]);
  const [nombre, setNombre]             = useState('');
  const [descripcion, setDescripcion]   = useState('');
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [confirmDelId, setConfirmDelId] = useState<number | null>(null);
  const [msg, setMsg]                   = useState('');
  const [msgType, setMsgType]           = useState<'success' | 'danger'>('success');

  useEffect(() => {
    getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  const showNotification = (message: string, type: 'success' | 'danger' = 'success') => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = nombre.trim();
    if (!cleanName) {
      showNotification('Debe ingresar un nombre de categoría válido.', 'danger');
      return;
    }
    if (categories.some(c => c.nombre.toLowerCase() === cleanName.toLowerCase())) {
      showNotification('Ya existe una categoría con esa denominación.', 'danger');
      return;
    }
    setSaving(true);
    try {
      const createdCategory = await createCategory(cleanName, descripcion.trim() || null);
      setCategories(prev => [...prev, createdCategory].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNombre('');
      setDescripcion('');
      showNotification('Categoría registrada correctamente.', 'success');
    } catch {
      showNotification('Ocurrió un error al intentar crear la categoría.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!confirmDelId) return;
    try {
      await deleteCategory(confirmDelId);
      setCategories(prev => prev.filter(c => c.id !== confirmDelId));
      setConfirmDelId(null);
      showNotification('Categoría eliminada de forma permanente.', 'success');
    } catch {
      showNotification('Imposible eliminar la categoría: contiene productos vinculados.', 'danger');
      setConfirmDelId(null);
    }
  };

  const selectedCategory = categories.find(c => c.id === confirmDelId);

  if (loading) return <Loader />;

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h4 mb-0 fw-semibold text-dark">Clasificación de Categorías</h1>
          <p className="text-muted mb-0 small">Estructuración y jerarquía taxonómica de los artículos del inventario</p>
        </div>
      </div>

      {msg && <div className={`alert alert-${msgType} py-2 small`}>{msg}</div>}

      <div className="row g-4">
        {/* Formulario */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 border-bottom">
              <span className="fw-semibold text-secondary small text-uppercase">Nueva Categoría</span>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddCategory}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Nombre de la Categoría *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ejemplo: Dispositivos de Red"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Descripción Funcional</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Detalles sobre los productos de este grupo..."
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-sm py-2" disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear Categoría'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Listado */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 border-bottom">
              <span className="fw-semibold text-secondary small text-uppercase">
                Categorías en Catálogo ({categories.length})
              </span>
            </div>
            {categories.length === 0 ? (
              <div className="card-body text-center text-muted py-4 small">
                No existen categorías configuradas en la base de datos.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 80 }}>Identificador</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Fecha de Registro</th>
                      <th className="text-end" style={{ width: 100 }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id}>
                        <td className="text-muted small">#{cat.id}</td>
                        <td className="fw-semibold small text-dark">{cat.nombre}</td>
                        <td className="text-muted small">{cat.descripcion || '—'}</td>
                        <td className="text-muted small">{formatDate(cat.fecha_creacion)}</td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            onClick={() => setConfirmDelId(cat.id!)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {confirmDelId !== null && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content shadow border-0">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fs-6 fw-semibold text-dark">Confirmar Eliminación</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDelId(null)} />
              </div>
              <div className="modal-body small p-3">
                ¿Está seguro de eliminar la categoría <strong>"{selectedCategory?.nombre}"</strong>? Esta acción fallará si cuenta con productos vinculados.
              </div>
              <div className="modal-footer border-top py-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setConfirmDelId(null)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={handleDeleteCategory}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

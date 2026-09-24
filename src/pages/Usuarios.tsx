import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUsers, createUser, deactivateUser, activateUser } from '../services/usuarioService';
import type { PerfilDB } from '../types/auth';
import Loader from '../components/feedback/Loader';
import { formatDate } from '../utils/formatters';

const INITIAL_FORM = { correo: '', password: '', nombreCompleto: '', rol: 'vendedor' };

export default function Usuarios() {
  const { session } = useAuth();
  const [users, setUsers]           = useState<PerfilDB[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(INITIAL_FORM);
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState('');
  const [msgType, setMsgType]       = useState<'success' | 'danger'>('success');

  useEffect(() => {
    getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const showNotification = (message: string, type: 'success' | 'danger' = 'success') => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3500);
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!createForm.nombreCompleto.trim() || !createForm.correo.trim()) {
      showNotification('Todos los campos marcados son obligatorios.', 'danger');
      return;
    }
    if (createForm.password.length < 6) {
      showNotification('La clave de acceso debe contener al menos 6 caracteres.', 'danger');
      return;
    }

    setSaving(true);
    try {
      const newUser = await createUser({
        correo: createForm.correo.trim(),
        password: createForm.password,
        nombreCompleto: createForm.nombreCompleto.trim(),
        rol: createForm.rol,
      });
      setUsers(prev => [...prev, newUser].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)));
      setShowCreate(false);
      setCreateForm(INITIAL_FORM);
      showNotification('Cuenta de usuario creada satisfactoriamente.', 'success');
    } catch (err: any) {
      showNotification(err?.message || 'Error al registrar la cuenta de usuario.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: PerfilDB) => {
    const isCurrentlyActive = user.estado === 'activo';
    try {
      if (isCurrentlyActive) {
        await deactivateUser(user.id);
        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, estado: 'inactivo' } : u)));
        showNotification(`La cuenta de ${user.nombre_completo} ha sido desactivada.`, 'success');
      } else {
        await activateUser(user.id);
        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, estado: 'activo' } : u)));
        showNotification(`La cuenta de ${user.nombre_completo} ha sido activada.`, 'success');
      }
    } catch {
      showNotification('Ocurrió un error al actualizar el estado de la cuenta.', 'danger');
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h4 mb-0 fw-semibold text-dark">Administración de Cuentas</h1>
          <p className="text-muted mb-0 small">Gestión de usuarios del sistema, niveles de autorización y credenciales</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm px-3" onClick={() => setShowCreate(true)}>
          Crear Nuevo Usuario
        </button>
      </div>

      {msg && <div className={`alert alert-${msgType} py-2 small`}>{msg}</div>}

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre y Apellido</th>
                <th>Correo Electrónico</th>
                <th>Rol Asignado</th>
                <th>Estado</th>
                <th>Fecha de Alta</th>
                <th className="text-end">Operaciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={u.estado === 'inactivo' ? 'table-light text-muted' : ''}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center fw-semibold"
                        style={{ width: 32, height: 32, fontSize: 13 }}
                      >
                        {u.nombre_completo.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold small">{u.nombre_completo}</div>
                        {u.id === session?.userId && (
                          <span className="badge bg-light text-secondary border" style={{ fontSize: '.65rem' }}>
                            Sesión actual
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-muted small">{u.correo}</td>
                  <td>
                    <span className={`badge ${u.rol === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                      {u.rol === 'admin' ? 'Administrador' : 'Vendedor'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.estado === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                      {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-muted small">{formatDate(u.fecha_creacion)}</td>
                  <td className="text-end">
                    {u.id !== session?.userId && (
                      <button
                        type="button"
                        className={`btn btn-sm ${u.estado === 'activo' ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2`}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fs-6 fw-semibold text-dark">Alta de Usuario</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreate(false)} />
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={createForm.nombreCompleto}
                      onChange={e => setCreateForm(f => ({ ...f, nombreCompleto: e.target.value }))}
                      placeholder="Nombres y Apellidos"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Correo Corporativo *</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={createForm.correo}
                      onChange={e => setCreateForm(f => ({ ...f, correo: e.target.value }))}
                      placeholder="usuario@empresa.com"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Clave Temporal *</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      value={createForm.password}
                      onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Rol de Seguridad *</label>
                    <select
                      className="form-select form-select-sm"
                      value={createForm.rol}
                      onChange={e => setCreateForm(f => ({ ...f, rol: e.target.value }))}
                    >
                      <option value="vendedor">Vendedor / Operador</option>
                      <option value="admin">Administrador General</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowCreate(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>
                    {saving ? 'Registrando...' : 'Confirmar Alta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

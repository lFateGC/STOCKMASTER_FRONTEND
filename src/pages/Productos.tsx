import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../services/productoService';
import type { ProductoDB, CategoriaDB } from '../types/producto';
import Loader from '../components/feedback/Loader';
import { formatCurrency } from '../utils/formatters';

const PAGE_SIZE = 10;

export default function Productos() {
  const { isAdmin } = useAuth();
  const [products, setProducts]     = useState<ProductoDB[]>([]);
  const [categories, setCategories] = useState<CategoriaDB[]>([]);
  const [loading, setLoading]       = useState<boolean>(true);
  const [msg, setMsg]               = useState('');
  const [msgType, setMsgType]       = useState<'success' | 'danger'>('success');

  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [filtered, setFiltered]       = useState<ProductoDB[]>([]);
  const [page, setPage]               = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm]           = useState({
    nombre: '',
    categoria_id: '',
    sku: '',
    descripcion: '',
    precio_venta: '',
    precio_compra: '',
    stock: '',
    stock_minimo: '5',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
      );
    }
    if (filterCat) list = list.filter(p => p.categoria_id === Number(filterCat));
    if (filterStock === 'ok')  list = list.filter(p => Number(p.stock || 0) > Number(p.stock_minimo || 5));
    if (filterStock === 'low') list = list.filter(p => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= Number(p.stock_minimo || 5));
    if (filterStock === 'out') list = list.filter(p => Number(p.stock || 0) === 0);
    setFiltered(list);
    setPage(1);
  }, [products, search, filterCat, filterStock]);

  const showNotification = (message: string, type: 'success' | 'danger' = 'success') => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3500);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({
      nombre: '',
      categoria_id: categories[0]?.id ? String(categories[0].id) : '',
      sku: '',
      descripcion: '',
      precio_venta: '',
      precio_compra: '',
      stock: '0',
      stock_minimo: '5',
    });
    setShowModal(true);
  };

  const openEdit = (p: ProductoDB) => {
    setEditingId(p.id!);
    setForm({
      nombre: p.nombre,
      categoria_id: p.categoria_id ? String(p.categoria_id) : '',
      sku: p.sku || '',
      descripcion: p.descripcion || '',
      precio_venta: String(p.precio_venta ?? ''),
      precio_compra: String(p.precio_compra ?? ''),
      stock: String(p.stock ?? 0),
      stock_minimo: String(p.stock_minimo ?? 5),
    });
    setShowModal(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      showNotification('El nombre del producto es obligatorio.', 'danger');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<ProductoDB> = {
        nombre: form.nombre.trim(),
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        sku: form.sku.trim() || null,
        descripcion: form.descripcion.trim() || null,
        precio_venta: Number(form.precio_venta) || 0,
        precio_compra: Number(form.precio_compra) || 0,
        stock: Number(form.stock) || 0,
        stock_minimo: Number(form.stock_minimo) || 5,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        showNotification('Ficha de producto actualizada correctamente.', 'success');
      } else {
        await createProduct(payload);
        showNotification('Producto incorporado al catálogo exitosamente.', 'success');
      }
      setShowModal(false);
      const updated = await getProducts();
      setProducts(updated);
    } catch (err: any) {
      showNotification(err?.message || 'Error al persistir los cambios.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Confirma la desactivación lógica de este ítem?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showNotification('El ítem fue desactivado del catálogo activo.', 'success');
    } catch {
      showNotification('Error al intentar desactivar el producto.', 'danger');
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <Loader />;

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h4 mb-0 fw-semibold text-dark">Catálogo Maestro de Productos</h1>
          <p className="text-muted mb-0 small">Administración de inventario, precios de venta y umbrales de reabastecimiento</p>
        </div>
        {isAdmin() && (
          <button type="button" className="btn btn-primary btn-sm px-3" onClick={openNew}>
            Nuevo Producto
          </button>
        )}
      </div>

      {msg && <div className={`alert alert-${msgType} py-2 small`}>{msg}</div>}

      {/* Barra de Filtros */}
      <div className="card card-body mb-3 shadow-sm border-0 d-flex flex-wrap gap-2 flex-row align-items-center">
        <input
          type="text"
          className="form-control form-control-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrar por nombre o SKU..."
          style={{ maxWidth: 260 }}
        />
        <select
          className="form-select form-select-sm"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select
          className="form-select form-select-sm"
          value={filterStock}
          onChange={e => setFilterStock(e.target.value)}
          style={{ maxWidth: 170 }}
        >
          <option value="">Todos los estados</option>
          <option value="ok">Existencias óptimas</option>
          <option value="low">Stock crítico / bajo</option>
          <option value="out">Sin existencias</option>
        </select>
        <span className="ms-auto text-muted small">{filtered.length} ítems en vista</span>
      </div>

      {/* Tabla de Productos */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 80 }}>Código</th>
                <th>SKU</th>
                <th>Descripción del Ítem</th>
                <th>Categoría</th>
                <th className="text-end">Precio Venta</th>
                {isAdmin() && <th className="text-end">Costo Compra</th>}
                <th className="text-center">Existencias</th>
                <th style={{ width: 130 }}>Condición</th>
                <th className="text-end" style={{ width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(p => {
                const stock = Number(p.stock || 0);
                const min = Number(p.stock_minimo || 5);
                const isOut = stock === 0;
                const isLow = stock > 0 && stock <= min;

                return (
                  <tr key={p.id}>
                    <td className="text-muted small">#{p.id}</td>
                    <td className="text-muted small font-monospace">{p.sku || '—'}</td>
                    <td className="fw-semibold small text-dark">{p.nombre}</td>
                    <td className="small">
                      <span className="badge bg-light text-dark border">
                        {p.categorias?.nombre || 'General'}
                      </span>
                    </td>
                    <td className="fw-semibold small text-end">{formatCurrency(Number(p.precio_venta || 0))}</td>
                    {isAdmin() && (
                      <td className="text-muted small text-end">{formatCurrency(Number(p.precio_compra || 0))}</td>
                    )}
                    <td className="small text-center fw-semibold">{stock}</td>
                    <td>
                      <span className={`badge ${isOut ? 'bg-danger' : isLow ? 'bg-warning text-dark' : 'bg-success'}`}>
                        {isOut ? 'Agotado' : isLow ? 'Stock Crítico' : 'Disponible'}
                      </span>
                    </td>
                    <td className="text-end">
                      {isAdmin() && (
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm py-1 px-2"
                            onClick={() => openEdit(p)}
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm py-1 px-2"
                            onClick={() => handleDelete(p.id!)}
                            title="Desactivar"
                          >
                            Baja
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4 small">
                    No se encontraron productos que coincidan con los criterios establecidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex align-items-center justify-content-between p-3 border-top">
            <small className="text-muted">Página {page} de {totalPages}</small>
            <div className="d-flex gap-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Anterior
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Alta / Edición */}
      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fs-6 fw-semibold text-dark">
                  {editingId ? 'Actualizar Ficha de Producto' : 'Incorporar Nuevo Producto'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Nombre o Descripción Comercial *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      placeholder="Ejemplo: Monitor LED 24 pulgadas"
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Categoría</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.categoria_id}
                        onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
                      >
                        <option value="">Seleccione una categoría</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Código SKU</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.sku}
                        onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                        placeholder="Identificador interno"
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Precio de Venta (PEN)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={form.precio_venta}
                        onChange={e => setForm(f => ({ ...f, precio_venta: e.target.value }))}
                        min="0"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Costo de Compra (PEN)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={form.precio_compra}
                        onChange={e => setForm(f => ({ ...f, precio_compra: e.target.value }))}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Stock Inicial</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={form.stock}
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        min="0"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Nivel Mínimo Crítico</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={form.stock_minimo}
                        onChange={e => setForm(f => ({ ...f, stock_minimo: e.target.value }))}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>
                    {saving ? 'Procesando...' : 'Guardar Ficha'}
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

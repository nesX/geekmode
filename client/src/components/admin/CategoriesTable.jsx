import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../lib/authStore';
import CategoryModal from './CategoryModal.jsx';
import { Plus, Pencil, XCircle, Tag, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export default function CategoriesTable() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, category: null });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`${API_URL}/api/admin/categories`);
      if (!res.ok) throw new Error('Error cargando categorias');
      const data = await res.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDeactivate = async (cat) => {
    if (cat.product_count > 0) {
      alert(`No se puede desactivar: tiene ${cat.product_count} producto(s) asociado(s). Remueve los productos de esta categoria primero.`);
      return;
    }
    if (!confirm(`Desactivar "${cat.name}"?`)) return;
    try {
      const res = await adminFetch(`${API_URL}/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al desactivar');
      }
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-red-400">
        <p className="mb-4">{error}</p>
        <button onClick={fetchCategories} className="text-sm text-primary hover:underline">Reintentar</button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-text-muted">{categories.length} categoria(s)</p>
        <button
          onClick={() => setModal({ open: true, category: null })}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoria
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted text-left">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold text-center">Productos</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-main">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{cat.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-text-muted text-xs font-mono">/{cat.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block min-w-[2.5rem] text-center font-bold text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {cat.product_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      cat.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {cat.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, category: cat })}
                        title="Editar"
                        className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-primary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {cat.is_active && (
                        <button
                          onClick={() => handleDeactivate(cat)}
                          title="Desactivar"
                          className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-text-muted">
                    <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay categorias. Crea la primera.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (
        <CategoryModal
          category={modal.category}
          onClose={() => setModal({ open: false, category: null })}
          onSaved={fetchCategories}
        />
      )}
    </>
  );
}

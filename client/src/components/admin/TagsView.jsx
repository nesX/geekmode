import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../lib/authStore';
import TagModal from './TagModal.jsx';
import { Plus, Pencil, XCircle, Tag, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export default function TagsView() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, tag: null });

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`${API_URL}/api/admin/tags`);
      if (!res.ok) throw new Error('Error cargando tags');
      const data = await res.json();
      setTags(data.tags);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const handleDeactivate = async (tag) => {
    if (tag.product_count > 0) {
      alert(`No se puede desactivar: tiene ${tag.product_count} producto(s) asociado(s). Remueve los productos de este tag primero.`);
      return;
    }
    if (!confirm(`Desactivar "${tag.name}"?`)) return;
    try {
      const res = await adminFetch(`${API_URL}/api/admin/tags/${tag.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al desactivar');
      }
      fetchTags();
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
        <button onClick={fetchTags} className="text-sm text-primary hover:underline">Reintentar</button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-text-muted">{tags.length} tag(s)</p>
        <button
          onClick={() => setModal({ open: true, tag: null })}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Tag
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
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-main">{tag.name}</p>
                    {tag.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{tag.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-text-muted text-xs font-mono">{tag.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block min-w-[2.5rem] text-center font-bold text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {tag.product_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, tag })}
                        title="Editar"
                        className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-primary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(tag)}
                        title="Desactivar"
                        disabled={tag.product_count > 0}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-text-muted">
                    <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay tags. Crea el primero.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (
        <TagModal
          tag={modal.tag}
          onClose={() => setModal({ open: false, tag: null })}
          onSaved={fetchTags}
        />
      )}
    </>
  );
}

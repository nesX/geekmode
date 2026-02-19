import { useState } from 'react';
import { adminFetch } from '../../lib/authStore';
import { X, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export default function TagModal({ tag, onClose, onSaved }) {
  const isEdit = !!tag;

  const [form, setForm] = useState({
    name: tag?.name || '',
    description: tag?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isEdit
        ? `${API_URL}/api/admin/tags/${tag.id}`
        : `${API_URL}/api/admin/tags`;
      const res = await adminFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar');

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-bold text-text-main">
            {isEdit ? 'Editar Tag' : 'Nuevo Tag'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Nombre *</label>
            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={50}
              value={form.name}
              onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Docker"
            />
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Slug</label>
              <input
                type="text"
                value={tag.slug}
                disabled
                className="w-full bg-background/50 border border-white/5 rounded-lg px-4 py-2.5 text-text-muted cursor-not-allowed"
              />
              <p className="text-xs text-text-muted/60 mt-1">El slug no se puede modificar para no romper URLs indexadas.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Descripcion</label>
            <textarea
              name="description"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="Descripcion del tag..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary hover:opacity-90 text-white font-bold py-2 px-5 rounded-lg transition-all text-sm disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Guardar Cambios' : 'Crear Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

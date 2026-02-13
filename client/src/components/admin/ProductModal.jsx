import { useState, useRef } from 'react';
import { getAuthHeaders } from '../../lib/authStore';
import useImageUpload from '../../lib/useImageUpload';
import ImageManager from './ImageManager';
import { X, Loader2, ImagePlus } from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export default function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name || '',
    base_price: product?.base_price ? Number(product.base_price) : '',
    description: product?.description || '',
    image_url: product?.image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { files, previews, errors: imageErrors, handleSelect, removeFile } = useImageUpload();
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'base_price' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        const body = {
          name: form.name,
          base_price: Number(form.base_price),
          description: form.description || undefined,
          image_url: form.image_url || undefined,
        };
        const res = await fetch(`${API_URL}/api/admin/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al guardar');
      } else {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('base_price', Number(form.base_price));
        if (form.description) formData.append('description', form.description);
        if (form.image_url) formData.append('image_url', form.image_url);
        files.forEach((file) => formData.append('images', file));

        const res = await fetch(`${API_URL}/api/admin/products`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al crear');
      }

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
        className="bg-surface rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-bold text-text-main">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Nombre *</label>
            <input
              type="text"
              name="name"
              required
              minLength={3}
              value={form.name}
              onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Camiseta Developer Mode"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Precio (COP) *</label>
            <input
              type="number"
              name="base_price"
              required
              min={1}
              value={form.base_price}
              onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="55000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Descripcion</label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="Descripcion del producto..."
            />
          </div>

          {/* Image section */}
          {isEdit ? (
            <ImageManager productId={product.id} />
          ) : (
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                Imagenes (opcional)
              </label>

              <div
                onClick={() => files.length < 8 && fileInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (files.length >= 8) return;
                  const dt = new DataTransfer();
                  Array.from(e.dataTransfer.files).forEach((f) => dt.items.add(f));
                  fileInputRef.current.files = dt.files;
                  fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                }}
                className={`border-2 border-dashed border-white/15 rounded-xl py-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 transition-colors ${files.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-1 text-text-muted">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-lg">+</span>
                </div>
                <p className="text-sm text-text-muted">
                  Arrastra imagenes o{' '}
                  <span className="text-primary underline">haz click para seleccionar</span>
                </p>
                <p className="text-xs text-text-muted/60">
                  JPG, PNG o WebP (max. 5MB por imagen, hasta 8 imagenes)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleSelect}
                className="hidden"
              />

              {imageErrors.length > 0 && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-2 space-y-0.5">
                  {imageErrors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              )}

              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10">
                      <img src={src} alt="" className="w-full h-20 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
              {isEdit ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

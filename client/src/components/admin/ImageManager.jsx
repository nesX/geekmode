import { useState, useEffect, useRef } from 'react';
import { adminFetch } from '../../lib/authStore';
import { getProductImageUrl } from '../../utils/imageUrl';

const API = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';
const MAX_IMAGES = 8;

export default function ImageManager({ productId }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    load();
  }, [productId]);

  async function load() {
    const res = await adminFetch(`${API}/api/admin/products/${productId}/images`);
    const data = await res.json();
    setImages(data.images || []);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append('image', file);
    const res = await adminFetch(`${API}/api/admin/products/${productId}/images`, {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setUploading(false);
      return;
    }
    setImages((prev) => [...prev, data.image]);
    setUploading(false);
    inputRef.current.value = '';
  }

  async function handleSetPrimary(imageId) {
    await adminFetch(`${API}/api/admin/products/${productId}/images/${imageId}/primary`, {
      method: 'PATCH',
    });
    setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })));
  }

  async function handleMove(index, dir) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((img, i) => ({ ...img, display_order: i }));
    setImages(reordered);
    await adminFetch(`${API}/api/admin/products/images/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: reordered.map(({ id, display_order }) => ({ id, display_order })),
      }),
    });
  }

  async function handleDelete(imageId) {
    if (!confirm('¿Eliminar esta imagen?')) return;
    await adminFetch(`${API}/api/admin/products/images/${imageId}`, {
      method: 'DELETE',
    });
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Imágenes ({images.length}/{MAX_IMAGES})
        </h3>
        <button
          onClick={() => inputRef.current.click()}
          disabled={uploading || images.length >= MAX_IMAGES}
          className="bg-primary hover:opacity-90 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : '+ Agregar'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <p className="text-center text-text-muted text-sm py-8">Sin imágenes</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative group rounded-lg overflow-hidden border border-white/10"
            >
              <img src={getProductImageUrl(img.filename, 'thumb')} alt={img.alt_text} className="w-full h-32 object-cover" />

              {img.is_primary && (
                <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Principal
                </span>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                <div className="flex justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMove(i, -1)}
                      disabled={i === 0}
                      className="bg-white/80 text-black text-xs px-1.5 py-0.5 rounded disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => handleMove(i, 1)}
                      disabled={i === images.length - 1}
                      className="bg-white/80 text-black text-xs px-1.5 py-0.5 rounded disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded"
                  >
                    ✕
                  </button>
                </div>
                {!img.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    className="bg-green-500 text-white text-xs w-full py-1 rounded"
                  >
                    Marcar principal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

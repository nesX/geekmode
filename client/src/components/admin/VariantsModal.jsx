import { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../../lib/authStore';
import { X, Plus, Loader2, Save } from 'lucide-react';
import ImageManager from './ImageManager';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export default function VariantsModal({ product, onClose }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New variant form
  const [newVariant, setNewVariant] = useState({ size: '', color: '', stock: 0 });
  const [adding, setAdding] = useState(false);

  // Track stock edits: { [variantId]: newStockValue }
  const [stockEdits, setStockEdits] = useState({});
  const [savingStock, setSavingStock] = useState({});

  const fetchVariants = useCallback(async () => {
    setLoading(true);
    try {
      // Use the product detail endpoint which includes variants
      const res = await fetch(`${API_URL}/api/products/${product.slug}`);
      if (!res.ok) throw new Error('Error cargando variantes');
      const data = await res.json();
      setVariants(data.product.variants || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [product.slug]);

  useEffect(() => { fetchVariants(); }, [fetchVariants]);

  const handleAddVariant = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${product.id}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          size: newVariant.size,
          color: newVariant.color,
          stock: Number(newVariant.stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al agregar variante');
      setNewVariant({ size: '', color: '', stock: 0 });
      fetchVariants();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleSaveStock = async (variantId) => {
    const stock = stockEdits[variantId];
    if (stock === undefined) return;

    setSavingStock((prev) => ({ ...prev, [variantId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/admin/variants/${variantId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ stock: Number(stock) }),
      });
      if (!res.ok) throw new Error('Error al actualizar stock');
      setStockEdits((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
      fetchVariants();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingStock((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-text-main">Variantes</h2>
            <p className="text-sm text-text-muted">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* Variants table */}
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="border-b border-white/10 text-text-muted text-left">
                    <th className="pb-3 font-semibold">Talla</th>
                    <th className="pb-3 font-semibold">Color</th>
                    <th className="pb-3 font-semibold text-center">Stock</th>
                    <th className="pb-3 font-semibold text-right w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className="border-b border-white/5">
                      <td className="py-3 text-text-main font-medium">{v.size}</td>
                      <td className="py-3 text-text-main">{v.color}</td>
                      <td className="py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          value={stockEdits[v.id] !== undefined ? stockEdits[v.id] : v.stock}
                          onChange={(e) => setStockEdits((prev) => ({ ...prev, [v.id]: e.target.value }))}
                          className="w-20 bg-background border border-white/10 rounded px-2 py-1 text-center text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </td>
                      <td className="py-3 text-right">
                        {stockEdits[v.id] !== undefined && (
                          <button
                            onClick={() => handleSaveStock(v.id)}
                            disabled={savingStock[v.id]}
                            className="p-1.5 rounded-lg hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
                            title="Guardar stock"
                          >
                            {savingStock[v.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {variants.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-muted">
                        Sin variantes. Agrega la primera abajo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Add variant form */}
              <div className="bg-background rounded-xl border border-white/10 p-4">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Agregar Variante</p>
                <form onSubmit={handleAddVariant} className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-text-muted mb-1">Talla</label>
                    <input
                      type="text"
                      required
                      value={newVariant.size}
                      onChange={(e) => setNewVariant((prev) => ({ ...prev, size: e.target.value }))}
                      className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="M"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-text-muted mb-1">Color</label>
                    <input
                      type="text"
                      required
                      value={newVariant.color}
                      onChange={(e) => setNewVariant((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="Negro"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-text-muted mb-1">Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={newVariant.stock}
                      onChange={(e) => setNewVariant((prev) => ({ ...prev, stock: e.target.value }))}
                      className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex items-center gap-1 bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm disabled:opacity-50 shrink-0"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Agregar
                  </button>
                </form>
              </div>
              {/* Image manager */}
              <ImageManager productId={product.id} />
            </>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

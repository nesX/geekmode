import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../lib/authStore';
import ProductModal from './ProductModal.jsx';
import VariantsModal from './VariantsModal.jsx';
import { Plus, Pencil, Layers, XCircle, Package, Loader2, ExternalLink } from 'lucide-react';
import { getProductImageUrl } from '../../utils/imageUrl';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

function formatPrice(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [productModal, setProductModal] = useState({ open: false, product: null });
  const [variantsModal, setVariantsModal] = useState({ open: false, product: null });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`${API_URL}/api/admin/products`);
      if (!res.ok) throw new Error('Error cargando productos');
      const data = await res.json();
      setProducts(data.products);
      setProductModal((prev) => {
        if (!prev.open || !prev.product) return prev;
        const updated = data.products.find((p) => p.id === prev.product.id);
        return updated ? { ...prev, product: updated } : prev;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Desactivar "${name}"? El producto dejara de mostrarse en la tienda.`)) return;
    try {
      const res = await adminFetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al desactivar');
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-text-muted">{products.length} producto(s)</p>
        <button
          onClick={() => setProductModal({ open: true, product: null })}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-24 text-red-400">
          <p className="mb-4">{error}</p>
          <button onClick={fetchProducts} className="text-sm text-primary hover:underline">Reintentar</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted text-left">
                <th className="px-6 py-4 font-semibold">Imagen</th>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Precio</th>
                <th className="px-6 py-4 font-semibold text-center">Stock</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    {p.image_filename ? (
                      <img src={getProductImageUrl(p.image_filename, 'thumb')} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                        <Package className="w-5 h-5 text-text-muted" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-main">{p.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">/{p.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-text-main font-medium">
                    {formatPrice(Number(p.base_price))}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block min-w-[2.5rem] text-center font-bold text-xs px-2 py-1 rounded-full ${
                      p.total_stock > 10 ? 'bg-green-500/20 text-green-400' :
                      p.total_stock > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {p.total_stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {p.is_active && (
                        <a
                          href={`/producto/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver producto publicado"
                          className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-accent transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => setProductModal({ open: true, product: p })}
                        title="Editar"
                        className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-primary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setVariantsModal({ open: true, product: p })}
                        title="Variantes"
                        className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-secondary transition-colors"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                      {p.is_active && (
                        <button
                          onClick={() => handleDeactivate(p.id, p.name)}
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
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-text-muted">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay productos. Crea el primero.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {productModal.open && (
        <ProductModal
          product={productModal.product}
          onClose={() => setProductModal({ open: false, product: null })}
          onSaved={fetchProducts}
        />
      )}
      {variantsModal.open && (
        <VariantsModal
          product={variantsModal.product}
          onClose={() => setVariantsModal({ open: false, product: null })}
        />
      )}
    </>
  );
}

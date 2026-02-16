import { useState, useEffect, useCallback, useRef } from 'react';
import { adminFetch } from '../../lib/authStore';
import OrderDetail from './OrderDetail.jsx';
import { ShoppingCart, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

const STATUS_FILTERS = [
  { key: null, label: 'Todos' },
  { key: 'PENDING_PAYMENT', label: 'Pendiente' },
  { key: 'PAID', label: 'Pagado' },
  { key: 'SHIPPED', label: 'Enviado' },
  { key: 'DELIVERED', label: 'Entregado' },
  { key: 'CANCELLED', label: 'Cancelado' },
];

const STATUS_BADGE = {
  PENDING_PAYMENT: 'bg-yellow-500/20 text-yellow-400',
  PAID: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-purple-500/20 text-purple-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

const STATUS_LABEL = {
  PENDING_PAYMENT: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

function formatPrice(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const debounceRef = useRef(null);

  const fetchOrders = useCallback(async (status, searchTerm, pg) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (searchTerm) params.set('search', searchTerm);
      if (pg) params.set('page', String(pg));
      const qs = params.toString();
      const res = await adminFetch(`${API_URL}/api/admin/orders${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Error cargando pedidos');
      const data = await res.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(statusFilter, search, page);
  }, [statusFilter, page, fetchOrders]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchOrders(statusFilter, search, 1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleFilterChange = (key) => {
    setStatusFilter(key);
    setPage(1);
  };

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-red-400">
        <p className="mb-4">{error}</p>
        <button onClick={() => fetchOrders(statusFilter, search, page)} className="text-sm text-primary hover:underline">Reintentar</button>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key ?? 'all'}
            onClick={() => handleFilterChange(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === f.key
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-surface border border-white/10 text-text-muted hover:text-text-main hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por numero de pedido o telefono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Count */}
      <p className="text-sm text-text-muted mb-4">{total} pedido(s)</p>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted text-left">
                <th className="px-6 py-4 font-semibold"># Pedido</th>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Telefono</th>
                <th className="px-6 py-4 font-semibold text-right">Total</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-text-muted">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay pedidos</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order.public_id)}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-primary">{order.public_id}</td>
                    <td className="px-6 py-4 text-text-main">{order.customer_name}</td>
                    <td className="px-6 py-4 text-text-muted">{order.customer_phone}</td>
                    <td className="px-6 py-4 text-right text-text-main font-medium">
                      {formatPrice(Number(order.total_amount) + Number(order.shipping_cost))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_BADGE[order.status] || ''}`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted text-xs">{formatDate(order.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-surface border border-white/10 text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-sm text-text-muted">
            Pagina {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-surface border border-white/10 text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetail
          publicId={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={() => fetchOrders(statusFilter, search, page)}
        />
      )}
    </>
  );
}

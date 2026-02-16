import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/authStore';
import { X, Loader2, Clock, Package, User, MapPin, FileText } from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

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

const VALID_TRANSITIONS = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['CANCELLED'],
  CANCELLED: [],
};

function formatPrice(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function OrderDetail({ publicId, onClose, onStatusUpdated }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminFetch(`${API_URL}/api/admin/orders/${publicId}`);
        if (!res.ok) throw new Error('Error cargando pedido');
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [publicId]);

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      const res = await adminFetch(`${API_URL}/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: note || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al actualizar');
      }
      // Refresh detail
      const detailRes = await adminFetch(`${API_URL}/api/admin/orders/${publicId}`);
      const detailData = await detailRes.json();
      setOrder(detailData.order);
      setNewStatus('');
      setNote('');
      onStatusUpdated?.();
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const allowedTransitions = order ? (VALID_TRANSITIONS[order.status] || []) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-surface border-l border-white/10 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-text-main">
            {loading ? 'Cargando...' : order ? order.public_id : 'Error'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-red-400">
            <p>{error}</p>
          </div>
        ) : order ? (
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${STATUS_BADGE[order.status]}`}>
                {STATUS_LABEL[order.status]}
              </span>
              <span className="text-xs text-text-muted">{formatDate(order.created_at)}</span>
            </div>

            {/* Customer Info */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-2">
                <User className="w-4 h-4 text-primary" />
                Datos del cliente
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-muted text-xs">Nombre</p>
                  <p className="text-text-main">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Telefono</p>
                  <p className="text-text-main">{order.customer_phone}</p>
                </div>
                {order.email && (
                  <div className="col-span-2">
                    <p className="text-text-muted text-xs">Email</p>
                    <p className="text-text-main">{order.email}</p>
                  </div>
                )}
              </div>
              {(order.customer_address || order.city || order.department) && (
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                    <MapPin className="w-3 h-3" />
                    Direccion
                  </div>
                  <p className="text-sm text-text-main">
                    {[order.customer_address, order.city, order.department].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-3">
                <Package className="w-4 h-4 text-primary" />
                Items del pedido
              </div>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {item.image_url && (
                      <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/10" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-text-main truncate">{item.product_name_snapshot || item.product_name}</p>
                      <p className="text-xs text-text-muted">
                        Talla: {item.size} | Color: {item.color} | Cant: {item.quantity}
                      </p>
                    </div>
                    <p className="text-text-main font-medium whitespace-nowrap">
                      {formatPrice(Number(item.price_at_purchase) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 space-y-1 text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Envio</span>
                  <span>{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Gratis'}</span>
                </div>
                <div className="flex justify-between text-text-main font-bold text-base pt-1">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total_amount) + Number(order.shipping_cost))}</span>
                </div>
              </div>
            </div>

            {/* Change Status */}
            {allowedTransitions.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  Cambiar estado
                </div>
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-sm text-text-main focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Seleccionar estado...</option>
                    {allowedTransitions.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nota opcional (max 500 caracteres)"
                    maxLength={500}
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-none"
                  />
                  {updateError && <p className="text-xs text-red-400">{updateError}</p>}
                  <button
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || updating}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all text-sm"
                  >
                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirmar cambio
                  </button>
                </div>
              </div>
            )}

            {/* Status History */}
            {order.status_history && order.status_history.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  Historial de estados
                </div>
                <div className="relative pl-4 border-l-2 border-white/10 space-y-4">
                  {order.status_history.map((entry) => (
                    <div key={entry.id} className="relative">
                      <div className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[entry.status]}`}>
                            {STATUS_LABEL[entry.status]}
                          </span>
                          <span className="text-xs text-text-muted">{formatDate(entry.created_at)}</span>
                        </div>
                        {entry.note && <p className="text-xs text-text-muted mt-1">{entry.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

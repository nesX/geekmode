import { useState } from 'react';
import { searchOrder } from '../../lib/api';
import { formatPrice } from '../../utils/format';

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  PAYMENT_FAILED: 'Pago fallido',
};

export default function OrderSearch() {
  const [publicId, setPublicId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const result = await searchOrder(publicId.trim(), phone.trim());
      setOrder(result);
    } catch (err) {
      setError(err.message || 'Pedido no encontrado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text-main mb-8">Buscar Pedido</h1>

      <form onSubmit={handleSubmit} className="bg-surface border border-white/10 rounded-xl p-6 mb-8">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Número de pedido</label>
            <input
              type="text"
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
              placeholder="ORD-1234"
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 text-text-main focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="3001234567"
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 text-text-main focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {order && <OrderDetail order={order} />}
    </div>
  );
}

function OrderDetail({ order }) {
  return (
    <div className="bg-surface border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-main">{order.public_id}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          order.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
          order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
          order.status === 'CANCELLED' || order.status === 'PAYMENT_FAILED' ? 'bg-red-500/10 text-red-500' :
          'bg-yellow-500/10 text-yellow-500'
        }`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <p className="text-text-muted">Nombre</p>
          <p className="text-text-main font-medium">{order.customer_name}</p>
        </div>
        <div>
          <p className="text-text-muted">Dirección</p>
          <p className="text-text-main font-medium">{order.customer_address}, {order.city}</p>
        </div>
      </div>

      {order.items && (
        <div className="border-t border-white/10 pt-4">
          <h3 className="font-bold text-text-main mb-3">Productos</h3>
          <ul className="space-y-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-text-muted">
                  {item.product_name_snapshot} ({item.size}/{item.color}) x{item.quantity}
                </span>
                <span className="text-text-main font-medium">
                  {formatPrice(Number(item.price_at_purchase) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 mt-4 pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Subtotal</span>
              <span className="text-text-main">{formatPrice(Number(order.total_amount))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Envío</span>
              <span className="text-text-main">{formatPrice(Number(order.shipping_cost))}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-text-main">Total</span>
              <span className="text-secondary">{formatPrice(Number(order.total_amount) + Number(order.shipping_cost))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getOrderByToken } from '../../lib/api';
import { formatPrice } from '../../utils/format';

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  PAYMENT_FAILED: 'Pago fallido',
};

const STATUS_STEPS = ['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED'];

export default function OrderTracking() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      window.location.href = '/pedido';
      return;
    }

    getOrderByToken(token)
      .then(setOrder)
      .catch(() => {
        setError('El enlace de seguimiento ha expirado o es inválido.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-text-muted">Cargando pedido...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-text-main mb-4">Enlace expirado</h1>
        <p className="text-text-muted mb-6">{error}</p>
        <a href="/pedido" className="text-primary font-bold hover:underline">
          Buscar pedido manualmente
        </a>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text-main mb-2">Pedido {order.public_id}</h1>
      <p className="text-text-muted mb-8">Seguimiento en tiempo real de tu pedido.</p>

      {/* Progress Steps */}
      <div className="bg-surface border border-white/10 rounded-xl p-6 mb-8">
        <div className="flex justify-between">
          {STATUS_STEPS.map((step, i) => {
            const isActive = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step} className="flex-1 text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-background border border-white/10 text-text-muted'
                } ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}>
                  {i + 1}
                </div>
                <p className={`text-xs ${isActive ? 'text-text-main font-medium' : 'text-text-muted'}`}>
                  {STATUS_LABELS[step]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-surface border border-white/10 rounded-xl p-6">
        <h2 className="font-bold text-text-main mb-4">Detalle del pedido</h2>

        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-text-muted">Nombre</p>
            <p className="text-text-main font-medium">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-text-muted">Dirección</p>
            <p className="text-text-main font-medium">{order.customer_address}, {order.city}, {order.department}</p>
          </div>
        </div>

        {order.items && (
          <div className="border-t border-white/10 pt-4">
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
    </div>
  );
}

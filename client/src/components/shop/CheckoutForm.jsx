import { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, cartTotal } from '../../lib/cartStore';
import { createOrder } from '../../lib/api';
import { formatPrice } from '../../utils/format';
import colombiaData from '../../data/municipios-colombia.json';

export default function CheckoutForm() {
  const $cartItems = useStore(cartItems);
  const $cartTotal = useStore(cartTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    city: '',
    department: '',
  });

  const departments = useMemo(
    () => [...colombiaData.departments].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const municipalities = useMemo(() => {
    if (!form.department) return [];
    const dep = colombiaData.departments.find((d) => d.name === form.department);
    return dep ? [...dep.municipalities].sort((a, b) => a.name.localeCompare(b.name)) : [];
  }, [form.department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      setForm({ ...form, department: value, city: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderData = {
        ...form,
        items: $cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const { publicId, paymentData } = await createOrder(orderData);

      // Initialize Wompi widget
      if (window.WidgetCheckout) {
        const checkout = new window.WidgetCheckout({
          currency: paymentData.currency,
          amountInCents: paymentData.amountInCents,
          reference: paymentData.reference,
          publicKey: paymentData.publicKey,
          signature: { integrity: paymentData.signature },
          redirectUrl: paymentData.redirectUrl,
          customerData: {
            email: paymentData.customerEmail,
            fullName: paymentData.customerFullName,
            phoneNumber: paymentData.customerPhoneNumber,
          },
        });
        checkout.open((result) => {
          const transaction = result.transaction;
          if (transaction && transaction.status === 'APPROVED') {
            window.location.href = `/pedido/confirmacion?id=${publicId}`;
          } else {
            window.location.href = `/pedido/confirmacion?id=${publicId}`;
          }
        });
      } else {
        // Fallback: redirect to confirmation
        window.location.href = `/pedido/confirmacion?id=${publicId}`;
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if ($cartItems.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-text-main mb-4">Tu carrito está vacío</h1>
        <a href="/" className="text-primary font-bold hover:underline">Volver a la tienda</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-main mb-8">Finalizar Compra</h1>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Nombre completo</label>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
            <input
              type="email"
              name="customer_email"
              value={form.customer_email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Teléfono</label>
            <input
              type="tel"
              name="customer_phone"
              value={form.customer_phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Dirección</label>
            <input
              type="text"
              name="customer_address"
              value={form.customer_address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Departamento</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 text-text-main focus:outline-none focus:border-primary"
              >
                <option value="">Seleccionar...</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.name}>{dep.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Municipio</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                disabled={!form.department}
                className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 text-text-main focus:outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="">Seleccionar...</option>
                {municipalities.map((mun) => (
                  <option key={mun.id} value={mun.name}>{mun.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Pagar'}
          </button>
        </form>

        {/* Cart Summary */}
        <div className="md:col-span-2">
          <div className="bg-surface rounded-xl border border-white/10 p-6 sticky top-8">
            <h2 className="text-lg font-bold text-text-main mb-4">Resumen</h2>
            <ul className="space-y-3 mb-4">
              {$cartItems.map((item) => (
                <li key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-text-muted">
                    {item.name} ({item.size}) x{item.quantity}
                  </span>
                  <span className="text-text-main font-medium">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-text-main">
              <span>Subtotal</span>
              <span className="text-secondary">{formatPrice($cartTotal)}</span>
            </div>
            <p className="text-xs text-text-muted mt-2">Envío calculado al confirmar.</p>
          </div>
        </div>
      </div>

      {/* Wompi Widget Script */}
      <script src="https://checkout.wompi.co/widget.js" />
    </div>
  );
}

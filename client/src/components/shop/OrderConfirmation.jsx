import { useEffect, useState } from 'react';
import { clearCart } from '../../lib/cartStore';

export default function OrderConfirmation() {
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '';
    setOrderId(id);
    clearCart();
  }, []);

  const whatsappMessage = encodeURIComponent(
    `Hola! Acabo de realizar el pedido ${orderId}. Quedo atento.`
  );

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-text-main mb-4">Pedido Creado</h1>

      {orderId && (
        <div className="bg-surface border border-white/10 rounded-xl p-6 mb-6">
          <p className="text-text-muted mb-2">Tu número de pedido es:</p>
          <p className="text-4xl font-black text-primary">{orderId}</p>
          <p className="text-sm text-text-muted mt-4">
            Guarda este número para consultar el estado de tu pedido.
          </p>
        </div>
      )}

      <p className="text-text-muted mb-8">
        Te enviaremos un email con los detalles de tu pedido una vez confirmemos el pago.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={`https://wa.me/573000000000?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.34 0-4.508-.682-6.34-1.852l-.442-.286-3.068 1.028 1.028-3.068-.286-.442A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Escribir por WhatsApp
        </a>
        <a
          href="/pedido"
          className="inline-flex items-center justify-center gap-2 bg-surface border border-white/10 text-text-main py-3 px-6 rounded-xl font-bold hover:bg-white/5 transition-all"
        >
          Consultar pedido
        </a>
      </div>
    </div>
  );
}

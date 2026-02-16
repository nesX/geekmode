import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, removeItem, updateQuantity, cartTotal } from '../../lib/cartStore';
import { isCartOpen, closeCart } from '../../lib/cartUiStore';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function CartFlyout() {
  const $isCartOpen = useStore(isCartOpen);
  const $cartItems = useStore(cartItems);
  const $cartTotal = useStore(cartTotal);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !$isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-surface shadow-2xl flex flex-col border-l border-white/10">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Tu Carrito
            </h2>
            <button onClick={closeCart} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {$cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-4 text-text-muted/30 border border-white/5">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <p className="text-text-muted font-medium">Tu carrito está vacío</p>
                <button
                  onClick={closeCart}
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {$cartItems.map((item) => (
                  <li key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="w-20 h-20 bg-background rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-text-main leading-tight">{item.name}</h3>
                          <p className="text-xs text-text-muted mt-1 uppercase">Talla: {item.size}</p>
                        </div>
                        <p className="font-bold text-secondary">{formatPrice(item.price)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-white/10 rounded-md overflow-hidden bg-background">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:bg-white/5 text-text-muted"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 text-sm font-bold min-w-[2rem] text-center text-text-main">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="p-1 hover:bg-white/5 text-text-muted"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="text-text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {$cartItems.length > 0 && (
            <div className="px-6 py-6 border-t border-white/10 bg-background/50">
              <div className="flex justify-between text-base font-bold text-text-main mb-4">
                <span>Total estimado</span>
                <span className="text-secondary text-lg">{formatPrice($cartTotal)}</span>
              </div>
              <p className="text-xs text-text-muted mb-6">
                Impuestos y envío calculados al finalizar la compra.
              </p>
              <a
                href="/checkout"
                onClick={closeCart}
                className="block w-full bg-primary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] text-center"
              >
                Finalizar Compra
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

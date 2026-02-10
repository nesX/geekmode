import { useStore } from '@nanostores/react';
import { cartCount } from '../../lib/cartStore';
import { toggleCart } from '../../lib/cartUiStore';
import { ShoppingCart } from 'lucide-react';

export default function CartCounter() {
  const $cartCount = useStore(cartCount);

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
      aria-label="Ver carrito"
    >
      <ShoppingCart className="w-6 h-6 text-primary" />
      {$cartCount > 0 && (
        <span className="absolute top-0 right-0 bg-secondary text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
          {$cartCount}
        </span>
      )}
    </button>
  );
}

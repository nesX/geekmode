import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartCount } from '../../lib/cartStore';
import { toggleCart } from '../../lib/cartUiStore';
import { ShoppingCart } from 'lucide-react';

export default function CartCounter() {
  const $cartCount = useStore(cartCount);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 hover:bg-white/5 rounded-full transition-colors group"
      aria-label="Ver carrito"
    >
      <ShoppingCart className="w-6 h-6 text-text-main group-hover:text-primary transition-colors" />
      {mounted && $cartCount > 0 && (
        <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
          {$cartCount}
        </span>
      )}
    </button>
  );
}

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { addItem } from '../../lib/cartStore';
import { selectedSize } from '../../lib/productStore';
import { openCart } from '../../lib/cartUiStore';
import { ShoppingCart, Check } from 'lucide-react';

export default function AddToCartButton({ product }) {
  const [isAdded, setIsAdded] = useState(false);
  const $selectedSize = useStore(selectedSize);

  const handleAdd = () => {
    const needsSize = product.sizes?.length > 0 && product.sizes[0] !== 'N/A' && product.sizes[0] !== 'Única';

    if (needsSize && !$selectedSize) {
      alert('Por favor selecciona una talla');
      return;
    }

    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: $selectedSize || 'N/A',
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 500);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isAdded}
      className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold transition-all ${
        isAdded
          ? 'bg-green-500 text-white'
          : 'bg-primary text-white hover:bg-slate-800'
      }`}
    >
      {isAdded ? (
        <>
          <Check className="w-5 h-5" />
          Agregado
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Agregar al Carrito
        </>
      )}
    </button>
  );
}

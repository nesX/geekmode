import { useStore } from '@nanostores/react';
import { selectedSize, setSelectedSize } from '../../lib/productStore';

export default function SizeSelector({ sizes }) {
  const $selectedSize = useStore(selectedSize);

  if (!sizes || sizes.length === 0 || sizes[0] === 'N/A' || sizes[0] === 'Única') {
    return null;
  }

  return (
    <div className="mb-8">
      <label className="block text-sm font-bold text-text-main mb-3 uppercase tracking-wider text-xs">Selecciona tu talla:</label>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`min-w-[3.5rem] h-12 flex items-center justify-center border-2 rounded-xl font-bold transition-all ${
              $selectedSize === size
                ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                : 'border-white/10 hover:border-white/30 bg-surface text-text-muted hover:text-text-main'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

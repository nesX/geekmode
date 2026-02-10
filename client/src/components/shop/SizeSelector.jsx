import { useStore } from '@nanostores/react';
import { selectedSize, setSelectedSize } from '../../lib/productStore';

export default function SizeSelector({ sizes }) {
  const $selectedSize = useStore(selectedSize);

  if (!sizes || sizes.length === 0 || sizes[0] === 'N/A' || sizes[0] === 'Única') {
    return null;
  }

  return (
    <div className="mb-8">
      <label className="block text-sm font-bold text-primary mb-3">Selecciona tu talla:</label>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`min-w-[3rem] h-12 flex items-center justify-center border-2 rounded-lg font-bold transition-all ${
              $selectedSize === size
                ? 'border-secondary bg-blue-50 text-secondary'
                : 'border-slate-200 hover:border-primary hover:bg-slate-50 text-slate-600'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

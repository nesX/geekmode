import { atom } from 'nanostores';

export const selectedSize = atom(null);

export const setSelectedSize = (size) => {
  selectedSize.set(size);
};

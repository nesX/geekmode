import { atom } from 'nanostores';

export const isCartOpen = atom(false);

export const openCart = () => isCartOpen.set(true);
export const closeCart = () => isCartOpen.set(false);
export const toggleCart = () => isCartOpen.set(!isCartOpen.get());

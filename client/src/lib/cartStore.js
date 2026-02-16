import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';

/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {number} price
 * @property {string} image
 * @property {string} size
 * @property {number} quantity
 */

/** @type {import('nanostores').WritableAtom<CartItem[]>} */
export const cartItems = persistentAtom('cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/**
 * Agrega un item al carrito.
 * @param {CartItem} item
 */
export const addItem = (item) => {
  const currentItems = cartItems.get();
  const existingItemIndex = currentItems.findIndex(
    (i) => i.id === item.id && i.size === item.size
  );

  if (existingItemIndex > -1) {
    const newItems = [...currentItems];
    newItems[existingItemIndex].quantity += item.quantity || 1;
    cartItems.set(newItems);
  } else {
    cartItems.set([...currentItems, { ...item, quantity: item.quantity || 1 }]);
  }
};

/**
 * Elimina un item del carrito.
 * @param {number} id
 * @param {string} size
 */
export const removeItem = (id, size) => {
  cartItems.set(cartItems.get().filter((i) => !(i.id === id && i.size === size)));
};

/**
 * Actualiza la cantidad de un item.
 * @param {number} id
 * @param {string} size
 * @param {number} quantity
 */
export const updateQuantity = (id, size, quantity) => {
  const newItems = cartItems.get().map((i) => {
    if (i.id === id && i.size === size) {
      return { ...i, quantity };
    }
    return i;
  });
  cartItems.set(newItems);
};

export const cartTotal = computed(cartItems, (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
});

export const cartCount = computed(cartItems, (items) => {
  return items.reduce((total, item) => total + item.quantity, 0);
});

export const clearCart = () => cartItems.set([]);

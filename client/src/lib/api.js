const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.products;
}

export async function fetchHomeData() {
  const res = await fetch(`${API_URL}/api/home`);
  if (!res.ok) throw new Error('Failed to fetch home data');
  return res.json();
}

export async function fetchProductBySlug(slug) {
  const res = await fetch(`${API_URL}/api/products/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  const data = await res.json();
  return data.product;
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return data.categories;
}

export async function fetchRelatedProducts(productId) {
  const res = await fetch(`${API_URL}/api/products/${productId}/related`);
  if (!res.ok) throw new Error('Failed to fetch related products');
  const data = await res.json();
  return data.products;
}

export async function fetchCategoryBySlug(slug) {
  const res = await fetch(`${API_URL}/api/categories/${slug}/products`);
  if (!res.ok) throw new Error('Failed to fetch category');
  const data = await res.json();
  return data;
}

export async function fetchSettings() {
  const res = await fetch(`${API_URL}/api/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  const data = await res.json();
  const map = {};
  for (const s of data.settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function searchProducts(query) {
  const res = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search products');
  const data = await res.json();
  return data;
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Error al crear el pedido');
  }
  return res.json();
}

export async function getOrderByToken(token) {
  const res = await fetch(`${API_URL}/api/orders/token/${token}`);
  if (!res.ok) throw new Error('Pedido no encontrado');
  const data = await res.json();
  return data.order;
}

export async function searchOrder(publicId, phone) {
  const res = await fetch(`${API_URL}/api/orders/${publicId}/${phone}`);
  if (!res.ok) throw new Error('Pedido no encontrado');
  const data = await res.json();
  return data.order;
}


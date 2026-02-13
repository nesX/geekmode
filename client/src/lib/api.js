const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.products;
}

export async function fetchProductBySlug(slug) {
  const res = await fetch(`${API_URL}/api/products/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  const data = await res.json();
  return data.product;
}

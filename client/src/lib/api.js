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

export async function fetchCategoryBySlug(slug) {
  const res = await fetch(`${API_URL}/api/categories/${slug}/products`);
  if (!res.ok) throw new Error('Failed to fetch category');
  const data = await res.json();
  return data;
}

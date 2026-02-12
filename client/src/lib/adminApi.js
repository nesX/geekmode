const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error inesperado');
  }

  return data;
};

export const adminApi = {
  googleLogin: (credential) =>
    request('/api/admin/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  logout: () => request('/api/admin/auth/logout', { method: 'POST' }),
  me: () => request('/api/admin/auth/me'),
  listProducts: () => request('/api/admin/products'),
  createProduct: (payload) => request('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  toggleArchive: (id) => request(`/api/admin/products/${id}/archive`, { method: 'PATCH' })
};

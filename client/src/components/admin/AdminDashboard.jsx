import React, { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../lib/adminApi';

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value || 0);

const emptyForm = {
  name: '',
  category: 'Camisetas',
  price: '',
  description: '',
  image: '',
  sizes: 'S,M,L'
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResponse = await adminApi.me();
        setAdminProfile(meResponse.user);
        const productsResponse = await adminApi.listProducts();
        const normalizedProducts = productsResponse.products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category || 'General',
          price: Number(product.base_price || 0),
          description: product.description || '',
          images: [product.image_url || ''],
          sizes: product.sizes || ['N/A'],
          status: product.is_active ? 'active' : 'archived'
        }));
        setProducts(normalizedProducts);
      } catch (_error) {
        window.location.href = '/admin/login';
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const activeProducts = useMemo(() => products.filter((product) => product.status === 'active').length, [products]);
  const archivedProducts = useMemo(() => products.filter((product) => product.status === 'archived').length, [products]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProductId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parsedPrice = Number(formData.price);
    if (!formData.name || Number.isNaN(parsedPrice) || parsedPrice <= 0) return;

    const basePayload = {
      name: formData.name,
      slug: slugify(formData.name),
      base_price: parsedPrice,
      category: formData.category,
      description: formData.description,
      image_url: formData.image || '/images/products/dev-black-front.jpg',
      sizes: formData.sizes.split(',').map((size) => size.trim()).filter(Boolean)
    };

    if (editingProductId) {
      const response = await adminApi.updateProduct(editingProductId, basePayload);
      const updated = response.product;
      setProducts((previous) =>
        previous.map((product) =>
          product.id === editingProductId
            ? {
                ...product,
                ...basePayload,
                price: Number(updated.base_price),
                images: [updated.image_url],
                status: updated.is_active ? 'active' : 'archived'
              }
            : product
        )
      );
      resetForm();
      return;
    }

    const response = await adminApi.createProduct(basePayload);
    const created = response.product;

    setProducts((previous) => [
      {
        id: created.id,
        name: created.name,
        slug: created.slug,
        category: basePayload.category,
        price: Number(created.base_price),
        description: created.description,
        images: [created.image_url],
        sizes: basePayload.sizes,
        status: created.is_active ? 'active' : 'archived'
      },
      ...previous
    ]);
    resetForm();
  };

  const handleEdit = (product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description,
      image: product.images?.[0] || '',
      sizes: product.sizes.join(',')
    });
  };

  const handleToggleArchive = async (productId) => {
    const response = await adminApi.toggleArchive(productId);
    const updated = response.product;

    setProducts((previous) =>
      previous.map((product) =>
        product.id === productId
          ? {
              ...product,
              status: updated.is_active ? 'active' : 'archived'
            }
          : product
      )
    );
  };

  const handleLogout = async () => {
    await adminApi.logout();
    window.location.href = '/admin/login';
  };

  if (isLoading) {
    return <p className="text-text-muted">Cargando dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      <section className="bg-surface border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-black text-text-main">Dashboard Admin</h1>
        <p className="text-text-muted mt-2">Gestiona tu catálogo con el mismo estilo geek de la tienda.</p>

        <div className="mt-6 flex items-center justify-between gap-4 bg-background/60 border border-white/10 rounded-xl p-4">
          <div>
            <p className="font-semibold">{adminProfile?.email}</p>
            <p className="text-sm text-text-muted">Rol: {adminProfile?.role}</p>
          </div>
          <button onClick={handleLogout} className="border border-white/20 hover:bg-white/5 px-4 py-2 rounded-lg text-sm">
            Cerrar sesión
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <article className="bg-surface border border-white/10 rounded-2xl p-5">
          <p className="text-text-muted text-sm">Total productos</p>
          <p className="text-3xl font-black text-primary mt-2">{products.length}</p>
        </article>
        <article className="bg-surface border border-white/10 rounded-2xl p-5">
          <p className="text-text-muted text-sm">Activos</p>
          <p className="text-3xl font-black text-secondary mt-2">{activeProducts}</p>
        </article>
        <article className="bg-surface border border-white/10 rounded-2xl p-5">
          <p className="text-text-muted text-sm">Archivados</p>
          <p className="text-3xl font-black text-accent mt-2">{archivedProducts}</p>
        </article>
      </section>

      <section className="grid lg:grid-cols-[1.1fr_1.4fr] gap-6">
        <article className="bg-surface border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-5">{editingProductId ? 'Editar producto' : 'Crear producto'}</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nombre del producto" className="w-full bg-background/70 border border-white/10 rounded-lg px-3 py-2" required />
            <div className="grid sm:grid-cols-2 gap-3">
              <input name="price" value={formData.price} onChange={handleInputChange} placeholder="Precio COP" type="number" className="w-full bg-background/70 border border-white/10 rounded-lg px-3 py-2" required />
              <input name="category" value={formData.category} onChange={handleInputChange} placeholder="Categoría" className="w-full bg-background/70 border border-white/10 rounded-lg px-3 py-2" required />
            </div>
            <input name="image" value={formData.image} onChange={handleInputChange} placeholder="URL imagen (opcional)" className="w-full bg-background/70 border border-white/10 rounded-lg px-3 py-2" />
            <input name="sizes" value={formData.sizes} onChange={handleInputChange} placeholder="Tallas separadas por coma" className="w-full bg-background/70 border border-white/10 rounded-lg px-3 py-2" />
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Descripción" rows={3} className="w-full bg-background/70 border border-white/10 rounded-lg px-3 py-2"></textarea>

            <div className="flex gap-3">
              <button type="submit" className="bg-primary hover:opacity-90 text-white font-semibold px-5 py-2 rounded-lg transition-opacity">
                {editingProductId ? 'Guardar cambios' : 'Crear producto'}
              </button>
              {editingProductId && (
                <button type="button" onClick={resetForm} className="border border-white/20 hover:bg-white/5 px-5 py-2 rounded-lg">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="bg-surface border border-white/10 rounded-2xl p-6 overflow-x-auto">
          <h2 className="text-xl font-bold mb-5">Administrar productos</h2>
          <table className="w-full min-w-[580px] text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-white/10">
                <th className="pb-3 font-medium">Producto</th>
                <th className="pb-3 font-medium">Precio</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 align-top">
                  <td className="py-3">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-text-muted text-xs mt-1">{product.category}</p>
                  </td>
                  <td className="py-3">{formatPrice(product.price)}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${product.status === 'active' ? 'text-secondary border-secondary/40 bg-secondary/10' : 'text-accent border-accent/40 bg-accent/10'}`}>
                      {product.status === 'active' ? 'Activo' : 'Archivado'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="text-xs px-3 py-1 rounded-md border border-white/20 hover:bg-white/5">
                        Editar
                      </button>
                      <button onClick={() => handleToggleArchive(product.id)} className="text-xs px-3 py-1 rounded-md border border-white/20 hover:bg-white/5">
                        {product.status === 'active' ? 'Archivar' : 'Reactivar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </div>
  );
}

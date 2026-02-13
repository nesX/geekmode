import * as productRepo from '../repositories/product.repository.js';

export async function getAllProducts() {
  return productRepo.findAllActive();
}

export async function getProductBySlug(slug) {
  const product = await productRepo.findBySlug(slug);
  if (!product) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  // Group variants by color for frontend consumption
  const variantsByColor = {};
  for (const v of product.variants) {
    if (!variantsByColor[v.color]) {
      variantsByColor[v.color] = [];
    }
    variantsByColor[v.color].push({ size: v.size, stock: v.stock });
  }
  product.variantsByColor = variantsByColor;

  return product;
}

export async function getProductById(id) {
  const product = await productRepo.findById(id);
  if (!product) {
    throw new Error('PRODUCT_NOT_FOUND');
  }
  return product;
}

// ── Admin functions ──

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function getAllProductsAdmin() {
  return productRepo.findAll();
}

export async function createProduct(data) {
  const slug = slugify(data.name);
  return productRepo.create({ ...data, slug });
}

export async function updateProduct(id, data) {
  const existing = await productRepo.findById(id);
  if (!existing) throw new Error('PRODUCT_NOT_FOUND');

  const slug = slugify(data.name);
  const product = await productRepo.update(id, { ...data, slug });
  return product;
}

export async function deactivateProduct(id) {
  const existing = await productRepo.findById(id);
  if (!existing) throw new Error('PRODUCT_NOT_FOUND');

  return productRepo.deactivate(id);
}

export async function addVariant(productId, data) {
  const product = await productRepo.findById(productId);
  if (!product) throw new Error('PRODUCT_NOT_FOUND');

  return productRepo.createVariant({ product_id: productId, ...data });
}

export async function updateVariantStock(variantId, stock) {
  const variant = await productRepo.updateVariantStock(variantId, stock);
  if (!variant) throw new Error('VARIANT_NOT_FOUND');
  return variant;
}

export async function getVariantsByProductId(productId) {
  return productRepo.findVariantsByProductId(productId);
}

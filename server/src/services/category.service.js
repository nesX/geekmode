import * as categoryRepo from '../repositories/category.repository.js';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function getAllCategories() {
  return categoryRepo.findAll();
}

export async function getActiveCategories() {
  return categoryRepo.findAllActive();
}

export async function getCategoriesWithProducts() {
  return categoryRepo.findAllWithProducts();
}

export async function getCategoryBySlug(slug) {
  const category = await categoryRepo.findBySlug(slug);
  if (!category) {
    throw new Error('CATEGORY_NOT_FOUND');
  }
  const products = await categoryRepo.findProductsByCategory(category.id);
  return { category, products };
}

export async function createCategory(data) {
  const slug = slugify(data.name);
  return categoryRepo.create({ ...data, slug });
}

export async function updateCategory(id, data) {
  const existing = await categoryRepo.findById(id);
  if (!existing) throw new Error('CATEGORY_NOT_FOUND');
  // El slug nunca se modifica despues de creado
  return categoryRepo.update(id, data);
}

export async function deactivateCategory(id) {
  const existing = await categoryRepo.findById(id);
  if (!existing) throw new Error('CATEGORY_NOT_FOUND');

  const count = await categoryRepo.countActiveProducts(id);
  if (count > 0) {
    const err = new Error('CATEGORY_HAS_PRODUCTS');
    err.productCount = count;
    throw err;
  }

  return categoryRepo.deactivate(id);
}

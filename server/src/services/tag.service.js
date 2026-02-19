import * as tagRepo from '../repositories/tag.repository.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function getAllTags() {
  return tagRepo.findAll();
}

export async function getTagsWithCount() {
  return tagRepo.findAllWithCount();
}

export async function getTagBySlug(slug) {
  const tag = await tagRepo.findBySlug(slug);
  if (!tag) {
    throw new Error('TAG_NOT_FOUND');
  }
  return tag;
}

export async function createTag({ name, description }) {
  const slug = slugify(name);
  const existing = await tagRepo.findBySlug(slug);
  if (existing) {
    throw new Error('TAG_ALREADY_EXISTS');
  }
  return tagRepo.create({ name, slug, description });
}

export async function updateTag(id, data) {
  const existing = await tagRepo.findById(id);
  if (!existing) throw new Error('TAG_NOT_FOUND');
  return tagRepo.update(id, data);
}

export async function deleteTag(id) {
  const existing = await tagRepo.findById(id);
  if (!existing) throw new Error('TAG_NOT_FOUND');

  const count = await tagRepo.countProducts(id);
  if (count > 0) {
    const err = new Error('TAG_HAS_PRODUCTS');
    err.productCount = count;
    throw err;
  }

  return tagRepo.deactivate(id);
}

export async function getProductsByTag(slug, limit = 50) {
  const tag = await getTagBySlug(slug);
  const products = await tagRepo.findProductsByTag(tag.id, limit);
  return { tag, products };
}

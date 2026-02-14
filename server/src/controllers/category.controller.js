import * as categoryService from '../services/category.service.js';
import logger from '../utils/logger.js';

export async function getCategories(req, res) {
  try {
    const categories = await categoryService.getCategoriesWithProducts();
    res.json({ categories });
  } catch (err) {
    logger.error('category.controller', `Error fetching categories: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener categorias' });
  }
}

export async function getCategoryBySlug(req, res) {
  try {
    const { category, products } = await categoryService.getCategoryBySlug(req.params.slug);
    res.json({ category, products });
  } catch (err) {
    if (err.message === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({ message: 'Categoria no encontrada' });
    }
    logger.error('category.controller', `Error fetching category: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener categoria' });
  }
}

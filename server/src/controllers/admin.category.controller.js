import { z } from 'zod';
import * as categoryService from '../services/category.service.js';
import * as productService from '../services/product.service.js';
import logger from '../utils/logger.js';

const CategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const CategoryIdsSchema = z.object({
  categoryIds: z.array(z.number().int().positive()),
});

export async function getCategories(req, res) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ categories });
  } catch (err) {
    logger.error('admin.category.controller', `getCategories error: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener categorias' });
  }
}

export async function createCategory(req, res) {
  try {
    const data = CategorySchema.parse(req.body);
    const category = await categoryService.createCategory(data);
    res.status(201).json({ category });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe una categoria con ese nombre/slug' });
    }
    logger.error('admin.category.controller', `createCategory error: ${err.message}`);
    res.status(500).json({ message: 'Error al crear categoria' });
  }
}

export async function updateCategory(req, res) {
  try {
    const data = CategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(Number(req.params.id), data);
    res.json({ category });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.message === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({ message: 'Categoria no encontrada' });
    }
    logger.error('admin.category.controller', `updateCategory error: ${err.message}`);
    res.status(500).json({ message: 'Error al actualizar categoria' });
  }
}

export async function deactivateCategory(req, res) {
  try {
    const category = await categoryService.deactivateCategory(Number(req.params.id));
    res.json({ category });
  } catch (err) {
    if (err.message === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({ message: 'Categoria no encontrada' });
    }
    if (err.message === 'CATEGORY_HAS_PRODUCTS') {
      return res.status(400).json({
        message: `No se puede desactivar: tiene ${err.productCount} producto(s) asociado(s)`,
      });
    }
    logger.error('admin.category.controller', `deactivateCategory error: ${err.message}`);
    res.status(500).json({ message: 'Error al desactivar categoria' });
  }
}

export async function updateProductCategories(req, res) {
  try {
    const { categoryIds } = CategoryIdsSchema.parse(req.body);
    await productService.updateProductCategories(Number(req.params.id), categoryIds);
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    logger.error('admin.category.controller', `updateProductCategories error: ${err.message}`);
    res.status(500).json({ message: 'Error al actualizar categorias del producto' });
  }
}

export async function getProductCategories(req, res) {
  try {
    const categories = await productService.getProductCategories(Number(req.params.id));
    res.json({ categories });
  } catch (err) {
    logger.error('admin.category.controller', `getProductCategories error: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener categorias del producto' });
  }
}

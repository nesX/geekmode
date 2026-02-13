import { z } from 'zod';
import * as productService from '../services/product.service.js';
import * as imageService from '../services/image.service.js';
import logger from '../utils/logger.js';

const ProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  base_price: z.number().positive(),
  image_url: z.string().url().optional(),
});

const VariantSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  stock: z.number().int().min(0).default(0),
});

const StockSchema = z.object({
  stock: z.number().int().min(0),
});

export async function getProducts(req, res) {
  try {
    const products = await productService.getAllProductsAdmin();
    res.json({ products });
  } catch (err) {
    logger.error('admin.product.controller', `getProducts error: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
}

export async function createProduct(req, res) {
  try {
    const body = {
      ...req.body,
      base_price: req.body.base_price !== undefined ? Number(req.body.base_price) : undefined,
    };
    const data = ProductSchema.parse(body);
    const product = await productService.createProduct(data);

    if (req.files && req.files.length > 0) {
      await imageService.uploadImagesForNewProduct(product.id, req.files);
    }

    res.status(201).json({ product });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un producto con ese nombre/slug' });
    }
    logger.error('admin.product.controller', `createProduct error: ${err.message}`);
    res.status(500).json({ message: 'Error al crear producto' });
  }
}

export async function updateProduct(req, res) {
  try {
    const data = ProductSchema.parse(req.body);
    const product = await productService.updateProduct(Number(req.params.id), data);
    res.json({ product });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un producto con ese nombre/slug' });
    }
    logger.error('admin.product.controller', `updateProduct error: ${err.message}`);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
}

export async function deactivateProduct(req, res) {
  try {
    const product = await productService.deactivateProduct(Number(req.params.id));
    res.json({ product });
  } catch (err) {
    if (err.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    logger.error('admin.product.controller', `deactivateProduct error: ${err.message}`);
    res.status(500).json({ message: 'Error al desactivar producto' });
  }
}

export async function addVariant(req, res) {
  try {
    const data = VariantSchema.parse(req.body);
    const variant = await productService.addVariant(Number(req.params.id), data);
    res.status(201).json({ variant });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe esa variante (talla/color)' });
    }
    logger.error('admin.product.controller', `addVariant error: ${err.message}`);
    res.status(500).json({ message: 'Error al agregar variante' });
  }
}

export async function updateStock(req, res) {
  try {
    const { stock } = StockSchema.parse(req.body);
    const variant = await productService.updateVariantStock(Number(req.params.id), stock);
    res.json({ variant });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.message === 'VARIANT_NOT_FOUND') {
      return res.status(404).json({ message: 'Variante no encontrada' });
    }
    logger.error('admin.product.controller', `updateStock error: ${err.message}`);
    res.status(500).json({ message: 'Error al actualizar stock' });
  }
}

import * as productService from '../services/product.service.js';
import logger from '../utils/logger.js';

export async function getProducts(req, res) {
  try {
    const products = await productService.getAllProducts();
    res.json({ products });
  } catch (err) {
    logger.error('product.controller', `Error fetching products: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
}

export async function getHomeData(req, res) {
  try {
    const data = await productService.getHomeData();
    res.json(data);
  } catch (err) {
    logger.error('product.controller', `Error fetching home data: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener datos del home' });
  }
}

export async function getRelatedProducts(req, res) {
  try {
    const products = await productService.getRelatedProducts(Number(req.params.id));
    res.json({ products });
  } catch (err) {
    logger.error('product.controller', `Error fetching related products: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener productos relacionados' });
  }
}

export async function searchProducts(req, res) {
  try {
    const products = await productService.searchProducts(req.query.q);
    res.json({ products, query: req.query.q });
  } catch (err) {
    if (err.message === 'QUERY_TOO_SHORT') {
      return res.status(400).json({ message: 'La búsqueda debe tener al menos 2 caracteres' });
    }
    logger.error('product.controller', `Error searching products: ${err.message}`);
    res.status(500).json({ message: 'Error al buscar productos' });
  }
}

export async function getProductBySlug(req, res) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json({ product });
  } catch (err) {
    if (err.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    logger.error('product.controller', `Error fetching product: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
}

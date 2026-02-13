import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/products
 * List all active products
 */
router.get('/products', productController.getProducts);

/**
 * GET /api/products/:slug
 * Get product detail by slug
 */
router.get('/products/:slug', productController.getProductBySlug);

export default router;

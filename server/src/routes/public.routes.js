import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import * as categoryController from '../controllers/category.controller.js';
import * as orderController from '../controllers/order.controller.js';

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
 * GET /api/home
 * Home page data (newest + categories with products)
 */
router.get('/home', productController.getHomeData);

/**
 * GET /api/products
 * List all active products
 */
router.get('/products', productController.getProducts);

/**
 * GET /api/products/:id/related
 * Get related products by product ID
 */
router.get('/products/:id/related', productController.getRelatedProducts);

/**
 * GET /api/products/:slug
 * Get product detail by slug
 */
router.get('/products/:slug', productController.getProductBySlug);

// ── Categories ──
router.get('/categories', categoryController.getCategories);
router.get('/categories/:slug/products', categoryController.getCategoryBySlug);

// ── Orders ──
router.post('/orders', orderController.createOrder);
router.get('/orders/token/:token', orderController.getOrderByToken);
router.get('/orders/:publicId/:phone', orderController.getOrderBySearch);

export default router;

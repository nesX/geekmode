import { Router } from 'express';
import {
  verifyGoogleToken,
  isAuthorizedAdmin,
  generateJWT,
  requireAdmin,
} from '../middlewares/auth.middleware.js';
import * as adminProductController from '../controllers/admin.product.controller.js';
import logger from '../utils/logger.js';
import { uploadImage as multerUpload, uploadImages } from '../middlewares/upload.middleware.js';
import * as imageController from '../controllers/admin.image.controller.js';
import * as categoryController from '../controllers/admin.category.controller.js';

const router = Router();

/**
 * POST /api/admin/auth/google
 * Authenticate with Google ID token and receive JWT
 */
router.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: 'Credencial de Google es requerida',
      });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);

    if (!googleUser) {
      return res.status(401).json({
        message: 'No fue posible validar la cuenta de Google',
      });
    }

    // Check if user is authorized admin
    if (!isAuthorizedAdmin(googleUser.email)) {
      return res.status(403).json({
        message: 'Tu cuenta de Google no esta autorizada como admin',
      });
    }

    // Generate JWT
    const token = generateJWT(googleUser);

    return res.json({
      token,
      user: {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
    });
  } catch (error) {
    logger.error('admin.routes', `Error in Google auth: ${error.message}`);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
});

/**
 * GET /api/admin/auth/me
 * Get current authenticated user info
 */
router.get('/auth/me', requireAdmin, (req, res) => {
  return res.json({
    user: {
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
      role: req.user.role,
    },
  });
});

/**
 * POST /api/admin/auth/verify
 * Verify if the current JWT is still valid
 */
router.post('/auth/verify', requireAdmin, (req, res) => {
  return res.json({ valid: true });
});

// ── Product CRUD (all protected) ──
router.get('/products', requireAdmin, adminProductController.getProducts);
router.post('/products', requireAdmin, uploadImages, adminProductController.createProduct);
router.put('/products/:id', requireAdmin, adminProductController.updateProduct);
router.delete('/products/:id', requireAdmin, adminProductController.deactivateProduct);
router.post('/products/:id/variants', requireAdmin, adminProductController.addVariant);
router.patch('/variants/:id/stock', requireAdmin, adminProductController.updateStock);

// ── Product Images ──
router.get('/products/:productId/images', requireAdmin, imageController.getImages);
router.post('/products/:productId/images', requireAdmin, multerUpload.single('image'), imageController.uploadImage);
router.patch('/products/:productId/images/:imageId/primary', requireAdmin, imageController.setPrimary);
router.patch('/products/images/reorder', requireAdmin, imageController.reorderImages);
router.delete('/products/images/:imageId', requireAdmin, imageController.deleteImage);

// ── Categories ──
router.get('/categories', requireAdmin, categoryController.getCategories);
router.post('/categories', requireAdmin, categoryController.createCategory);
router.put('/categories/:id', requireAdmin, categoryController.updateCategory);
router.delete('/categories/:id', requireAdmin, categoryController.deactivateCategory);

// ── Product Categories ──
router.get('/products/:id/categories', requireAdmin, categoryController.getProductCategories);
router.patch('/products/:id/categories', requireAdmin, categoryController.updateProductCategories);

export default router;

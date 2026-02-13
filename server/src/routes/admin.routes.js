import { Router } from 'express';
import {
  verifyGoogleToken,
  isAuthorizedAdmin,
  generateJWT,
  requireAdmin,
} from '../middlewares/auth.middleware.js';

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
    console.error('Error in Google auth:', error);
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

export default router;

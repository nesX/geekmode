import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Verifies Google ID token using Google's tokeninfo endpoint.
 * @param {string} credential - The Google ID token
 * @returns {Promise<{email: string, name: string, picture: string, sub: string} | null>}
 */
export async function verifyGoogleToken(credential) {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (!response.ok) {
      logger.error('auth.middleware', `Google token validation failed: ${response.status}`);
      return null;
    }

    const payload = await response.json();

    // Verify the token is for our application
    if (env.googleClientId && payload.aud !== env.googleClientId) {
      logger.error('auth.middleware', 'Token audience mismatch');
      return null;
    }

    // Verify email is verified
    if (payload.email_verified !== 'true' && payload.email_verified !== true) {
      logger.error('auth.middleware', 'Email not verified');
      return null;
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (error) {
    logger.error('auth.middleware', `Error verifying Google token: ${error.message}`);
    return null;
  }
}

/**
 * Checks if an email is authorized as admin.
 * TODO: In the future, read from database
 * @param {string} email
 * @returns {boolean}
 */
export function isAuthorizedAdmin(email) {
  const normalizedEmail = email.toLowerCase().trim();
  return env.adminEmails.includes(normalizedEmail);
}

/**
 * Generates a JWT token for an authenticated user.
 * @param {object} user - User data to encode
 * @returns {string}
 */
export function generateJWT(user) {
  return jwt.sign(
    {
      sub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: 'admin',
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

/**
 * Verifies a JWT token.
 * @param {string} token
 * @returns {{sub: string, email: string, name: string, picture: string, role: string, iat: number, exp: number} | null}
 */
export function verifyJWT(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to extract and validate JWT from Authorization header.
 * Sets req.user if valid token is present.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = verifyJWT(token);

  if (decoded) {
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      role: decoded.role,
    };
  } else {
    req.user = null;
  }

  next();
}

/**
 * Middleware to require authenticated admin user.
 * Returns 401 if not authenticated.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  next();
}

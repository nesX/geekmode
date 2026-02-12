import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { env } from '../config/env.js';
import { hasDbConfig, pool } from '../config/db.js';
import { requireAdminSession } from '../middlewares/auth.middleware.js';

const router = Router();
const COOKIE_NAME = 'geekshop_session';

const productStore = [
  {
    id: 1,
    name: 'Camiseta Developer Pro (Negro)',
    slug: 'camiseta-developer-black',
    description: 'Camiseta de algodón 100% premium con diseño minimalista para desarrolladores. Cómoda y duradera.',
    base_price: 55000,
    image_url: '/images/products/dev-black-front.jpg',
    is_active: true
  }
];

const sessionStore = new Map();

const upsertUserByEmail = async (email) => {
  if (hasDbConfig && pool) {
    const existing = await pool.query('SELECT id, email, role FROM users WHERE email = $1 LIMIT 1', [email]);
    if (existing.rows[0]) {
      return existing.rows[0];
    }

    const inserted = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, 'GOOGLE_AUTH_ONLY', 'admin']
    );

    return inserted.rows[0];
  }

  return {
    id: 1,
    email,
    role: 'admin'
  };
};

const createSession = (user) => {
  const token = randomUUID();
  const expiresAt = Date.now() + env.sessionTtlMs;
  sessionStore.set(token, {
    user: { id: user.id, email: user.email, role: user.role },
    expiresAt
  });
  return token;
};

const setSessionCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: env.sessionTtlMs
  });
};

const verifyGoogleCredential = async (credential) => {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();

    if (!payload.email || payload.email_verified !== 'true') {
      return null;
    }

    if (env.googleClientId && payload.aud !== env.googleClientId) {
      return null;
    }

    return payload;
  } catch (_error) {
    return null;
  }
};

router.use((req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    req.user = null;
    return next();
  }

  const session = sessionStore.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessionStore.delete(token);
    req.user = null;
    return next();
  }

  req.user = session.user;
  return next();
});

router.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body || {};

    if (!credential) {
      return res.status(400).json({ message: 'Credential de Google es requerida' });
    }

    const googlePayload = await verifyGoogleCredential(credential);

    if (!googlePayload) {
      return res.status(401).json({ message: 'No fue posible validar la cuenta de Google' });
    }

    const email = String(googlePayload.email).toLowerCase().trim();

    if (!env.adminGoogleEmails.includes(email)) {
      return res.status(403).json({ message: 'Tu cuenta de Google no está autorizada como admin' });
    }

    const user = await upsertUserByEmail(email);
    const token = createSession(user);
    setSessionCookie(res, token);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'No fue posible iniciar sesión con Google', error: error.message });
  }
});

router.post('/auth/logout', (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    sessionStore.delete(token);
  }

  res.clearCookie(COOKIE_NAME);
  return res.status(204).send();
});

router.get('/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  return res.json({ user: req.user });
});

router.get('/products', requireAdminSession, (_req, res) => {
  res.json({ products: productStore });
});

router.post('/products', requireAdminSession, (req, res) => {
  const { name, description = '', base_price, image_url = '', is_active = true } = req.body || {};

  if (!name || !base_price) {
    return res.status(400).json({ message: 'name y base_price son obligatorios' });
  }

  const nextId = Math.max(...productStore.map((product) => product.id), 0) + 1;
  const product = {
    id: nextId,
    name,
    slug: String(name).toLowerCase().replace(/\s+/g, '-'),
    description,
    base_price: Number(base_price),
    image_url,
    is_active: Boolean(is_active)
  };

  productStore.unshift(product);
  return res.status(201).json({ product });
});

router.put('/products/:id', requireAdminSession, (req, res) => {
  const productId = Number(req.params.id);
  const index = productStore.findIndex((product) => product.id === productId);

  if (index === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  const current = productStore[index];
  const payload = req.body || {};

  productStore[index] = {
    ...current,
    ...payload,
    base_price: payload.base_price ? Number(payload.base_price) : current.base_price
  };

  return res.json({ product: productStore[index] });
});

router.patch('/products/:id/archive', requireAdminSession, (req, res) => {
  const productId = Number(req.params.id);
  const product = productStore.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  product.is_active = !product.is_active;
  return res.json({ product });
});

export default router;

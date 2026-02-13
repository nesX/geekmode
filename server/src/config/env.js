import 'dotenv/config';

/**
 * Environment configuration with defaults
 */
export const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:4321',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

  // Admin emails - array of authorized emails
  // TODO: In the future, read from database
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),

  // Logging
  LOG_PATH: process.env.LOG_PATH || 'logs',

  // Media / Images
  MEDIA_PATH: process.env.MEDIA_PATH || 'uploads/products',
  MEDIA_URL_PREFIX: process.env.MEDIA_URL_PREFIX || '/media/products',
  MAX_IMAGES_PER_PRODUCT: parseInt(process.env.MAX_IMAGES_PER_PRODUCT || '8', 10),

  // Database (optional)
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'geekshop',
    user: process.env.DB_USER || '',
    pass: process.env.DB_PASS || '',
  },

  get isProduction() {
    return this.nodeEnv === 'production';
  },

  get isDevelopment() {
    return this.nodeEnv === 'development';
  },
};

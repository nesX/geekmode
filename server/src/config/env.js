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
  imageStorage: process.env.IMAGE_STORAGE || 'local',
  MEDIA_PATH: process.env.MEDIA_PATH || 'uploads/products',
  MEDIA_URL_PREFIX: process.env.MEDIA_URL_PREFIX || '/media/products',
  MAX_IMAGES_PER_PRODUCT: parseInt(process.env.MAX_IMAGES_PER_PRODUCT || '8', 10),

  // Payments
  paymentProvider: process.env.PAYMENT_PROVIDER || 'wompi',
  wompiPublicKey: process.env.WOMPI_PUBLIC_KEY || '',
  wompiPrivateKey: process.env.WOMPI_PRIVATE_KEY || '',
  wompiEventsSecret: process.env.WOMPI_EVENTS_SECRET || '',

  // Shipping
  shippingCost: parseInt(process.env.SHIPPING_COST || '12000', 10),
  freeShippingThreshold: parseInt(process.env.FREE_SHIPPING_THRESHOLD || '150000', 10),

  // Email
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'console',
  emailFrom: process.env.EMAIL_FROM || 'GeekShop <noreply@geekmode.co>',

  // SMTP
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '1025', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_SECURE: process.env.SMTP_SECURE || 'false',

  // Resend (futuro)
  resendApiKey: process.env.RESEND_API_KEY || '',

  // SendGrid (futuro)
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4321',

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

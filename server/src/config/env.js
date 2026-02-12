import dotenv from 'dotenv';

dotenv.config();

const parseAdminEmails = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:4321',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  sessionTtlMs: Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 8),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  adminGoogleEmails: parseAdminEmails(process.env.ADMIN_GOOGLE_EMAILS || process.env.ADMIN_EMAIL || 'admin@tienda.com'),
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'mitienda',
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT || 5432)
  }
};

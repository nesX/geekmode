import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import logger from './utils/logger.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import adminRoutes from './routes/admin.routes.js';
import publicRoutes from './routes/public.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.clientOrigin,
  credentials: true,
}));

// Logging
if (env.isDevelopment) {
  app.use(morgan('dev'));
}

// Serve uploaded images in development (Nginx handles this in production)
if (env.isDevelopment) {
  app.use('/media/products', express.static('uploads/products'));
}

// Webhooks — raw body for signature verification, mounted before general JSON parser
app.use('/api/webhooks', express.json(), webhookRoutes);

// Body parsing
app.use(express.json());

// Auth middleware - extracts user from JWT if present
app.use(authMiddleware);

// Routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GeekShop API',
    status: 'ok',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint no encontrado' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('app', `Unhandled error: ${err.message}`);
  res.status(500).json({
    message: env.isProduction ? 'Error interno del servidor' : err.message,
  });
});

// Start server
app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
  console.log(`Client origin: ${env.clientOrigin}`);
  console.log(`Authorized admins: ${env.adminEmails.length} email(s)`);
});

export default app;

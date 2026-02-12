import { Router } from 'express';

const router = Router();

router.post('/payments', (_req, res) => {
  res.status(501).json({ message: 'Webhook de pagos pendiente de implementación.' });
});

export default router;

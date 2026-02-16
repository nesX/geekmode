import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';

const router = Router();

router.post('/payment', orderController.handleWebhook);

export default router;

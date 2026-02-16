import { z } from 'zod';
import * as orderService from '../services/order.service.js';
import logger from '../utils/logger.js';

const CreateOrderSchema = z.object({
  customer_name: z.string().min(2, 'Nombre requerido'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(7, 'Teléfono requerido'),
  customer_address: z.string().min(5, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  department: z.string().min(2, 'Departamento requerido'),
  items: z.array(z.object({
    id: z.number().int().positive(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })).min(1, 'El carrito no puede estar vacío'),
});

export async function createOrder(req, res) {
  try {
    const data = CreateOrderSchema.parse(req.body);
    const result = await orderService.createOrder(data, data.items);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos inválidos', errors: err.errors });
    }
    logger.error('order.controller', `createOrder error: ${err.message}`);
    res.status(500).json({ message: 'Error al crear el pedido' });
  }
}

export async function getOrderByToken(req, res) {
  try {
    const order = await orderService.getOrderByToken(req.params.token);
    res.json({ order });
  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    logger.error('order.controller', `getOrderByToken error: ${err.message}`);
    res.status(500).json({ message: 'Error al buscar el pedido' });
  }
}

export async function getOrderBySearch(req, res) {
  try {
    const order = await orderService.getOrderByPhoneAndId(req.params.phone, req.params.publicId);
    res.json({ order });
  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    logger.error('order.controller', `getOrderBySearch error: ${err.message}`);
    res.status(500).json({ message: 'Error al buscar el pedido' });
  }
}

export async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-event-checksum'] || '';
    await orderService.confirmPayment(req.body, signature);
    res.status(200).json({ ok: true });
  } catch (err) {
    logger.error('order.controller', `handleWebhook error: ${err.message}`);
    // Always respond 200 to webhooks to prevent retries
    res.status(200).json({ ok: true });
  }
}

import { z } from 'zod';
import * as orderService from '../services/order.service.js';
import logger from '../utils/logger.js';

const UpdateStatusSchema = z.object({
  status: z.enum(['PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  note: z.string().max(500).optional(),
});

export async function getOrders(req, res) {
  try {
    const { status, search, page } = req.query;
    const result = await orderService.getOrders({
      status,
      search,
      page: page ? parseInt(page) : undefined,
    });
    res.json(result);
  } catch (err) {
    logger.error('admin.order.controller', `getOrders error: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
}

export async function getOrderDetail(req, res) {
  try {
    const order = await orderService.getOrderDetail(req.params.publicId);
    res.json({ order });
  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    logger.error('admin.order.controller', `getOrderDetail error: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener el pedido' });
  }
}

export async function updateStatus(req, res) {
  try {
    const data = UpdateStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(
      Number(req.params.orderId),
      data.status,
      data.note
    );
    res.json({ order });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    if (err.message === 'INVALID_STATUS_TRANSITION') {
      return res.status(400).json({ message: 'Transicion de estado no permitida' });
    }
    logger.error('admin.order.controller', `updateStatus error: ${err.message}`);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
}

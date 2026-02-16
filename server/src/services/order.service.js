import crypto from 'crypto';
import { env } from '../config/env.js';
import * as orderRepo from '../repositories/order.repository.js';
import * as stockRepo from '../repositories/stock.repository.js';
import { getPaymentAdapter } from '../payments/payment.factory.js';
import { sendOrderConfirmation } from './email.service.js';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export function calculateShipping(subtotal) {
  if (subtotal >= env.freeShippingThreshold) return 0;
  return env.shippingCost;
}

export async function generatePublicId() {
  for (let i = 0; i < 3; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const publicId = `ORD-${num}`;
    const exists = await orderRepo.existsByPublicId(publicId);
    if (!exists) return publicId;
  }
  // Fallback with more digits
  const num = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${num}`;
}

export function generateMagicToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return { token, expiresAt };
}

export async function createOrder(customerData, cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = calculateShipping(subtotal);
  const publicId = await generatePublicId();
  const { token: magicToken, expiresAt: magicTokenExpiresAt } = generateMagicToken();

  const order = await orderRepo.create({
    public_id: publicId,
    customer_name: customerData.customer_name,
    customer_phone: customerData.customer_phone,
    customer_address: customerData.customer_address,
    email: customerData.customer_email,
    city: customerData.city,
    department: customerData.department,
    total_amount: subtotal,
    shipping_cost: shippingCost,
    magic_token: magicToken,
    magic_token_expires_at: magicTokenExpiresAt,
    items: cartItems.map((item) => ({
      variant_id: item.id,
      quantity: item.quantity,
      price: item.price,
      product_name: item.name,
    })),
  });

  const adapter = getPaymentAdapter();
  const paymentData = adapter.createSession(order);

  return { publicId, paymentData };
}

export async function confirmPayment(webhookPayload, signature) {
  const adapter = getPaymentAdapter();

  const isValid = adapter.verifyWebhook(webhookPayload, signature);
  if (!isValid) {
    logger.warn('order.service', 'Invalid webhook signature');
    return;
  }

  const event = adapter.parseWebhookEvent(webhookPayload);
  const order = await orderRepo.findByPublicId(event.reference);
  if (!order) {
    logger.warn('order.service', `Order not found for reference: ${event.reference}`);
    return;
  }

  if (event.paymentSessionId) {
    await orderRepo.updatePaymentSession(order.id, event.paymentSessionId);
  }

  if (event.status === 'PAID') {
    // Decrement stock in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of order.items) {
        const result = await stockRepo.decrementStock(item.variant_id, item.quantity, client);
        if (!result) {
          logger.warn('order.service', `Insufficient stock for variant ${item.variant_id} on order ${order.public_id}`);
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('order.service', `Stock decrement failed: ${err.message}`);
    } finally {
      client.release();
    }

    await orderRepo.updateStatus(order.id, 'PAID', 'Pago confirmado via webhook');

    // Fire-and-forget email
    sendOrderConfirmation(order, order.magic_token).catch(() => {});
  } else if (event.status !== 'PENDING_PAYMENT') {
    await orderRepo.updateStatus(order.id, event.status, `Webhook: ${event.status}`);
  }
}

export async function getOrderByToken(token) {
  const order = await orderRepo.findByMagicToken(token);
  if (!order) throw new Error('ORDER_NOT_FOUND');
  return order;
}

export async function getOrderByPhoneAndId(phone, publicId) {
  const order = await orderRepo.findByPhoneAndPublicId(phone, publicId);
  if (!order) throw new Error('ORDER_NOT_FOUND');
  return order;
}

const VALID_TRANSITIONS = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['CANCELLED'],
  CANCELLED: [],
};

export async function getOrders({ status, search, page } = {}) {
  const { orders, total } = await orderRepo.findAll({ status, search, page });
  const limit = 20;
  return { orders, total, page: page || 1, totalPages: Math.ceil(total / limit) };
}

export async function getOrderDetail(publicId) {
  const order = await orderRepo.findByPublicIdAdmin(publicId);
  if (!order) throw new Error('ORDER_NOT_FOUND');
  return order;
}

export async function updateOrderStatus(orderId, newStatus, note) {
  const order = await orderRepo.findById(orderId);
  if (!order) throw new Error('ORDER_NOT_FOUND');

  const allowed = VALID_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error('INVALID_STATUS_TRANSITION');
  }

  return orderRepo.updateStatusAdmin(orderId, newStatus, note);
}

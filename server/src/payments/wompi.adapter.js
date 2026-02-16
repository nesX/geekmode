import crypto from 'crypto';
import { env } from '../config/env.js';

function generateIntegritySignature(reference, amountInCents, currency) {
  const data = `${reference}${amountInCents}${currency}${env.wompiPrivateKey}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function createSession(order) {
  const amountInCents = (order.total_amount + order.shipping_cost) * 100;
  const reference = order.public_id;
  const currency = 'COP';
  const signature = generateIntegritySignature(reference, amountInCents, currency);

  return {
    publicKey: env.wompiPublicKey,
    amountInCents,
    currency,
    reference,
    signature,
    redirectUrl: `${env.frontendUrl}/pedido/confirmacion?id=${order.public_id}`,
    customerEmail: order.email,
    customerFullName: order.customer_name,
    customerPhoneNumber: order.customer_phone,
  };
}

export function verifyWebhook(payload, signature) {
  const properties = payload.data?.transaction || {};
  const concat = `${properties.id}${properties.status}${properties.amount_in_cents}${env.wompiEventsSecret}`;
  const computedHash = crypto.createHash('sha256').update(concat).digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const computedBuffer = Buffer.from(computedHash, 'hex');

  if (sigBuffer.length !== computedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, computedBuffer);
}

export function parseWebhookEvent(payload) {
  const transaction = payload.data?.transaction || {};
  const statusMap = {
    APPROVED: 'PAID',
    DECLINED: 'PAYMENT_FAILED',
    VOIDED: 'CANCELLED',
    ERROR: 'PAYMENT_FAILED',
  };

  return {
    reference: transaction.reference,
    status: statusMap[transaction.status] || 'PENDING_PAYMENT',
    paymentSessionId: String(transaction.id || ''),
  };
}

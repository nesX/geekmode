import { getEmailAdapter } from './email.factory.js';
import { orderConfirmationTemplate } from './templates/order-confirmation.js';
import { magicLinkTemplate } from './templates/magic-link.js';
import logger from '../../utils/logger.js';
import { env } from '../../config/env.js';

export async function sendOrderConfirmation(order, magicToken) {
  try {
    const magicLink = `${env.frontendUrl}/pedido/tracking?token=${magicToken}`;

    const { html, text } = orderConfirmationTemplate({
      customerName: order.customer_name,
      publicId: order.public_id,
      totalAmount: order.total_amount,
      shippingCost: order.shipping_cost,
      items: order.items,
      magicLink,
    });

    const adapter = getEmailAdapter();
    const result = await adapter.send({
      to: order.email,
      subject: `Confirmación de pedido #${order.public_id}`,
      html,
      text,
    });

    if (!result.success) {
      logger.error('email.service', `Failed to send order confirmation: ${result.error}`);
    }

    return result;
  } catch (err) {
    logger.error('email.service', `Error sending order confirmation: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export async function sendMagicLink(email, customerName, publicId, magicToken) {
  try {
    const magicLink = `${env.frontendUrl}/pedido/tracking?token=${magicToken}`;

    const { html, text } = magicLinkTemplate({
      customerName,
      publicId,
      magicLink,
    });

    const adapter = getEmailAdapter();
    const result = await adapter.send({
      to: email,
      subject: `Consulta tu pedido #${publicId}`,
      html,
      text,
    });

    if (!result.success) {
      logger.error('email.service', `Failed to send magic link: ${result.error}`);
    }

    return result;
  } catch (err) {
    logger.error('email.service', `Error sending magic link: ${err.message}`);
    return { success: false, error: err.message };
  }
}

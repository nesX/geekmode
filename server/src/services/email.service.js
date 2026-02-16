import { env } from '../config/env.js';
import logger from '../utils/logger.js';

let resend = null;

async function getResendClient() {
  if (!env.resendApiKey) return null;
  if (resend) return resend;

  try {
    const { Resend } = await import('resend');
    resend = new Resend(env.resendApiKey);
    return resend;
  } catch {
    logger.error('email.service', 'Failed to initialize Resend client');
    return null;
  }
}

export async function sendOrderConfirmation(order, magicToken) {
  try {
    const client = await getResendClient();
    if (!client) return;

    const trackingUrl = `${env.frontendUrl}/pedido/tracking?token=${magicToken}`;

    await client.emails.send({
      from: env.emailFrom,
      to: order.email,
      subject: `Pedido ${order.public_id} confirmado - GeekShop`,
      html: `
        <h1>¡Gracias por tu compra!</h1>
        <p>Tu pedido <strong>${order.public_id}</strong> ha sido confirmado.</p>
        <p><strong>Total:</strong> $${Number(order.total_amount + order.shipping_cost).toLocaleString('es-CO')}</p>
        <p>Puedes seguir el estado de tu pedido aquí:</p>
        <p><a href="${trackingUrl}">Ver estado de mi pedido</a></p>
        <p>Si tienes preguntas, escríbenos por WhatsApp.</p>
        <br/>
        <p>— Equipo GeekShop</p>
      `,
    });

    logger.info('email.service', `Confirmation email sent for order ${order.public_id}`);
  } catch (err) {
    logger.error('email.service', `Failed to send confirmation email: ${err.message}`);
  }
}

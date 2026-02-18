export function orderConfirmationTemplate({
  customerName,
  publicId,
  totalAmount,
  shippingCost,
  items,
  magicLink,
}) {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.productName || item.product_name} - ${item.size || ''} ${item.color || ''}</td>
      <td>x${item.quantity}</td>
      <td>$${Number(item.price).toLocaleString('es-CO')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-number { font-size: 24px; font-weight: bold; color: #000; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GeekShop</h1>
        </div>
        <div class="content">
          <h2>¡Gracias por tu compra, ${customerName}!</h2>
          <p>Tu pedido ha sido recibido y está en proceso.</p>

          <div class="order-number">Pedido #${publicId}</div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="2">Envío</td>
                <td>$${Number(shippingCost).toLocaleString('es-CO')}</td>
              </tr>
              <tr class="total">
                <td colspan="2">Total</td>
                <td>$${Number(totalAmount).toLocaleString('es-CO')}</td>
              </tr>
            </tbody>
          </table>

          <p>Puedes consultar el estado de tu pedido en cualquier momento:</p>
          <a href="${magicLink}" class="button">Ver mi pedido</a>

          <p><small>Este link es válido por 30 días.</small></p>
        </div>
        <div class="footer">
          <p>GeekShop - Camisetas geek para developers</p>
          <p>Si tienes dudas, contáctanos por WhatsApp</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `GeekShop - Confirmación de Pedido

¡Gracias por tu compra, ${customerName}!

Tu pedido #${publicId} ha sido recibido.

Productos:
${items.map(item => `- ${item.productName || item.product_name} - ${item.size || ''} ${item.color || ''} x${item.quantity} - $${Number(item.price).toLocaleString('es-CO')}`).join('\n')}

Envío: $${Number(shippingCost).toLocaleString('es-CO')}
Total: $${Number(totalAmount).toLocaleString('es-CO')}

Consulta tu pedido aquí: ${magicLink}

Este link es válido por 30 días.`;

  return { html, text };
}

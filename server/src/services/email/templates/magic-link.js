export function magicLinkTemplate({
  customerName,
  publicId,
  magicLink,
}) {
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
          <h2>Consulta tu pedido</h2>
          <p>Hola ${customerName},</p>
          <p>Haz clic en el botón para ver el estado de tu pedido #${publicId}:</p>
          <a href="${magicLink}" class="button">Ver mi pedido</a>
          <p><small>Este link es válido por 30 días.</small></p>
        </div>
        <div class="footer">
          <p>GeekShop - Camisetas geek para developers</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `GeekShop - Link de consulta de pedido

Hola ${customerName},

Consulta el estado de tu pedido #${publicId} aquí:
${magicLink}

Este link es válido por 30 días.`;

  return { html, text };
}

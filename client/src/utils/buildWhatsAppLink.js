export function buildWhatsAppLink(phone, context, data = {}) {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  let message = '';

  switch (context) {
    case 'checkout':
      message = 'Hola, tengo problemas para completar mi pedido';
      break;
    case 'order':
      message = `Hola, mi pedido es ${data.orderId || ''}`;
      break;
    case 'product':
      message = `Hola, tengo dudas sobre ${data.productName || 'un producto'}`;
      break;
    case 'general':
    default:
      message = 'Hola, tengo una consulta';
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

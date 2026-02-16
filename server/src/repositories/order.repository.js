import pool from '../config/db.js';

export async function create(orderData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [order] } = await client.query(
      `INSERT INTO orders
        (public_id, customer_name, customer_phone, customer_address, email, city, department,
         total_amount, shipping_cost, status, payment_method, magic_token, magic_token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        orderData.public_id,
        orderData.customer_name,
        orderData.customer_phone,
        orderData.customer_address,
        orderData.email,
        orderData.city,
        orderData.department,
        orderData.total_amount,
        orderData.shipping_cost,
        orderData.status || 'PENDING_PAYMENT',
        orderData.payment_method || 'WOMPI',
        orderData.magic_token,
        orderData.magic_token_expires_at,
      ]
    );

    for (const item of orderData.items) {
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase, product_name_snapshot)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.variant_id, item.quantity, item.price, item.product_name]
      );
    }

    await client.query(
      `INSERT INTO order_status_history (order_id, status, note)
       VALUES ($1, $2, $3)`,
      [order.id, 'PENDING_PAYMENT', 'Pedido creado']
    );

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findByPublicId(publicId) {
  const { rows: [order] } = await pool.query(
    'SELECT * FROM orders WHERE public_id = $1',
    [publicId]
  );
  if (!order) return null;

  const { rows: items } = await pool.query(
    `SELECT oi.*, v.size, v.color, p.slug AS product_slug,
            COALESCE(pi.image_url, p.image_url) AS image_url
     FROM order_items oi
     JOIN variants v ON v.id = oi.variant_id
     JOIN products p ON p.id = v.product_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE oi.order_id = $1`,
    [order.id]
  );

  return { ...order, items };
}

export async function findByMagicToken(token) {
  const { rows: [order] } = await pool.query(
    `SELECT * FROM orders
     WHERE magic_token = $1 AND magic_token_expires_at > NOW()`,
    [token]
  );
  if (!order) return null;

  const { rows: items } = await pool.query(
    `SELECT oi.*, v.size, v.color, p.slug AS product_slug,
            COALESCE(pi.image_url, p.image_url) AS image_url
     FROM order_items oi
     JOIN variants v ON v.id = oi.variant_id
     JOIN products p ON p.id = v.product_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE oi.order_id = $1`,
    [order.id]
  );

  return { ...order, items };
}

export async function findByPhoneAndPublicId(phone, publicId) {
  const { rows: [order] } = await pool.query(
    'SELECT * FROM orders WHERE customer_phone = $1 AND public_id = $2',
    [phone, publicId]
  );
  if (!order) return null;

  const { rows: items } = await pool.query(
    `SELECT oi.*, v.size, v.color, p.slug AS product_slug,
            COALESCE(pi.image_url, p.image_url) AS image_url
     FROM order_items oi
     JOIN variants v ON v.id = oi.variant_id
     JOIN products p ON p.id = v.product_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE oi.order_id = $1`,
    [order.id]
  );

  return { ...order, items };
}

export async function updateStatus(orderId, status, note) {
  await pool.query(
    'UPDATE orders SET status = $2 WHERE id = $1',
    [orderId, status]
  );
  await pool.query(
    'INSERT INTO order_status_history (order_id, status, note) VALUES ($1, $2, $3)',
    [orderId, status, note]
  );
}

export async function updatePaymentSession(orderId, paymentSessionId) {
  await pool.query(
    'UPDATE orders SET payment_session_id = $2 WHERE id = $1',
    [orderId, paymentSessionId]
  );
}

export async function findById(orderId) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  return rows[0] || null;
}

export async function findItemsByOrderId(orderId) {
  const { rows } = await pool.query(
    `SELECT oi.*, v.size, v.color, p.slug AS product_slug,
            COALESCE(pi.image_url, p.image_url) AS image_url
     FROM order_items oi
     JOIN variants v ON v.id = oi.variant_id
     JOIN products p ON p.id = v.product_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE oi.order_id = $1`,
    [orderId]
  );
  return rows;
}

export async function existsByPublicId(publicId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM orders WHERE public_id = $1',
    [publicId]
  );
  return rows.length > 0;
}

export async function findAll({ status, search, page = 1, limit = 20 } = {}) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`o.status = $${paramIndex++}`);
    params.push(status);
  }

  if (search) {
    conditions.push(`(o.public_id ILIKE $${paramIndex} OR o.customer_phone ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const countQuery = `SELECT COUNT(*) FROM orders o ${where}`;
  const { rows: [{ count }] } = await pool.query(countQuery, params);

  const dataQuery = `
    SELECT o.id, o.public_id, o.customer_name, o.customer_phone,
           o.total_amount, o.shipping_cost, o.status, o.payment_method, o.created_at
    FROM orders o
    ${where}
    ORDER BY o.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex}
  `;

  const { rows: orders } = await pool.query(dataQuery, [...params, limit, offset]);

  return { orders, total: parseInt(count) };
}

export async function findByPublicIdAdmin(publicId) {
  const { rows: [order] } = await pool.query(
    'SELECT * FROM orders WHERE public_id = $1',
    [publicId]
  );
  if (!order) return null;

  const { rows: items } = await pool.query(
    `SELECT oi.*, v.size, v.color, p.name AS product_name, p.slug AS product_slug,
            COALESCE(pi.image_url, p.image_url) AS image_url
     FROM order_items oi
     JOIN variants v ON v.id = oi.variant_id
     JOIN products p ON p.id = v.product_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE oi.order_id = $1`,
    [order.id]
  );

  const { rows: statusHistory } = await pool.query(
    `SELECT id, status, note, created_at
     FROM order_status_history
     WHERE order_id = $1
     ORDER BY created_at ASC`,
    [order.id]
  );

  return { ...order, items, status_history: statusHistory };
}

export async function updateStatusAdmin(orderId, status, note) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [order] } = await client.query(
      'UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [orderId, status]
    );
    await client.query(
      'INSERT INTO order_status_history (order_id, status, note) VALUES ($1, $2, $3)',
      [orderId, status, note || null]
    );
    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

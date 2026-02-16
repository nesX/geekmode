import pool from '../config/db.js';

export async function decrementStock(variantId, quantity, client = pool) {
  const { rows } = await client.query(
    `UPDATE variants SET stock = stock - $2
     WHERE id = $1 AND stock >= $2
     RETURNING id, stock`,
    [variantId, quantity]
  );
  return rows[0] || null;
}

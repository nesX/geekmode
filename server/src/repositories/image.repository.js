import pool from '../config/db.js';

export async function findByProductId(productId) {
  const { rows } = await pool.query(
    `SELECT * FROM product_images
     WHERE product_id = $1
     ORDER BY display_order ASC, created_at ASC`,
    [productId]
  );
  return rows;
}

export async function findById(imageId) {
  const { rows } = await pool.query(
    `SELECT * FROM product_images WHERE id = $1`,
    [imageId]
  );
  return rows[0] || null;
}

export async function create({ productId, url, altText, displayOrder }) {
  const { rows } = await pool.query(
    `INSERT INTO product_images (product_id, url, alt_text, display_order)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [productId, url, altText, displayOrder]
  );
  return rows[0];
}

export async function setPrimary(imageId, productId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE product_images SET is_primary = false WHERE product_id = $1`,
      [productId]
    );
    const { rows } = await client.query(
      `UPDATE product_images SET is_primary = true WHERE id = $1 RETURNING *`,
      [imageId]
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateOrder(images) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const img of images) {
      await client.query(
        `UPDATE product_images SET display_order = $1 WHERE id = $2`,
        [img.display_order, img.id]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function remove(imageId) {
  await pool.query(`DELETE FROM product_images WHERE id = $1`, [imageId]);
}

import pool from '../config/db.js';

export async function findAll() {
  const { rows } = await pool.query(`
    SELECT * FROM tags
    WHERE is_active = true
    ORDER BY name ASC
  `);
  return rows;
}

export async function findAllWithCount() {
  const { rows } = await pool.query(`
    SELECT t.*, COUNT(pt.product_id)::int AS product_count
    FROM tags t
    LEFT JOIN product_tags pt ON pt.tag_id = t.id
    WHERE t.is_active = true
    GROUP BY t.id
    ORDER BY t.name ASC
  `);
  return rows;
}

export async function findBySlug(slug) {
  const { rows } = await pool.query(
    'SELECT * FROM tags WHERE slug = $1 AND is_active = true',
    [slug]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM tags WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function findByProductId(productId) {
  const { rows } = await pool.query(
    `SELECT t.* FROM tags t
     JOIN product_tags pt ON pt.tag_id = t.id
     WHERE pt.product_id = $1 AND t.is_active = true
     ORDER BY t.name ASC`,
    [productId]
  );
  return rows;
}

export async function create({ name, slug, description }) {
  const { rows } = await pool.query(
    `INSERT INTO tags (name, slug, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, slug, description || '']
  );
  return rows[0];
}

export async function update(id, { name, description }) {
  const { rows } = await pool.query(
    `UPDATE tags SET name = $2, description = $3
     WHERE id = $1 RETURNING *`,
    [id, name, description || '']
  );
  return rows[0] || null;
}

export async function deactivate(id) {
  const { rows } = await pool.query(
    'UPDATE tags SET is_active = false WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] || null;
}

export async function countProducts(tagId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM product_tags pt
     JOIN products p ON p.id = pt.product_id
     WHERE pt.tag_id = $1 AND p.is_active = true`,
    [tagId]
  );
  return rows[0].count;
}

export async function findProductsByTag(tagId, limit = 50) {
  const { rows } = await pool.query(`
    SELECT p.*, COALESCE(SUM(v.stock), 0)::int AS total_stock,
           pi.filename AS image_filename
    FROM products p
    JOIN product_tags pt ON pt.product_id = p.id
    LEFT JOIN variants v ON v.product_id = p.id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    WHERE pt.tag_id = $1 AND p.is_active = true
    GROUP BY p.id, pi.filename
    ORDER BY p.created_at DESC
    LIMIT $2
  `, [tagId, limit]);
  return rows;
}

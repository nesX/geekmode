import pool from '../config/db.js';

export async function findAll() {
  const { rows } = await pool.query(`
    SELECT c.*,
      COUNT(pc.product_id)::int AS product_count
    FROM categories c
    LEFT JOIN product_categories pc ON pc.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
  return rows;
}

export async function findAllActive() {
  const { rows } = await pool.query(`
    SELECT * FROM categories
    WHERE is_active = true
    ORDER BY name ASC
  `);
  return rows;
}

export async function findAllWithProducts() {
  const { rows } = await pool.query(`
    SELECT c.*
    FROM categories c
    WHERE c.is_active = true
      AND EXISTS (
        SELECT 1 FROM product_categories pc
        JOIN products p ON p.id = pc.product_id
        WHERE pc.category_id = c.id AND p.is_active = true
      )
    ORDER BY c.name ASC
  `);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function findBySlug(slug) {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE slug = $1 AND is_active = true',
    [slug]
  );
  return rows[0] || null;
}

export async function findProductsByCategory(categoryId) {
  const { rows } = await pool.query(`
    SELECT
      p.id, p.name, p.slug, p.description, p.base_price,
      COALESCE(pi.filename, p.image_filename) AS image_filename,
      COALESCE(SUM(v.stock), 0)::int AS total_stock
    FROM products p
    JOIN product_categories pc ON pc.product_id = p.id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    LEFT JOIN variants v ON v.product_id = p.id
    WHERE pc.category_id = $1 AND p.is_active = true
    GROUP BY p.id, pi.filename
    ORDER BY p.created_at DESC
  `, [categoryId]);
  return rows;
}

export async function create({ name, slug, description }) {
  const { rows } = await pool.query(
    `INSERT INTO categories (name, slug, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, slug, description || '']
  );
  return rows[0];
}

export async function update(id, { name, description }) {
  const { rows } = await pool.query(
    `UPDATE categories SET name = $2, description = $3
     WHERE id = $1 RETURNING *`,
    [id, name, description || '']
  );
  return rows[0] || null;
}

export async function deactivate(id) {
  const { rows } = await pool.query(
    'UPDATE categories SET is_active = false WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] || null;
}

export async function countActiveProducts(categoryId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM product_categories pc
     JOIN products p ON p.id = pc.product_id
     WHERE pc.category_id = $1 AND p.is_active = true`,
    [categoryId]
  );
  return rows[0].count;
}

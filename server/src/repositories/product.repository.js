import pool from '../config/db.js';

export async function findAllActive() {
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.base_price,
      p.image_url,
      COALESCE(SUM(v.stock), 0)::int AS total_stock
    FROM products p
    LEFT JOIN variants v ON v.product_id = p.id
    WHERE p.is_active = true
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  return rows;
}

export async function findBySlug(slug) {
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.base_price,
      p.image_url,
      COALESCE(
        json_agg(
          json_build_object('id', v.id, 'size', v.size, 'color', v.color, 'stock', v.stock)
        ) FILTER (WHERE v.id IS NOT NULL),
        '[]'
      ) AS variants
    FROM products p
    LEFT JOIN variants v ON v.product_id = p.id
    WHERE p.slug = $1 AND p.is_active = true
    GROUP BY p.id
  `, [slug]);
  return rows[0] || null;
}

export async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

// ── Admin functions ──

export async function findAll() {
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.base_price,
      p.image_url,
      p.is_active,
      COALESCE(SUM(v.stock), 0)::int AS total_stock
    FROM products p
    LEFT JOIN variants v ON v.product_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  return rows;
}

export async function create({ name, slug, description, base_price, image_url }) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, slug, description, base_price, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, slug, description, base_price, image_url]
  );
  return rows[0];
}

export async function update(id, { name, slug, description, base_price, image_url }) {
  const { rows } = await pool.query(
    `UPDATE products
     SET name = $2, slug = $3, description = $4, base_price = $5, image_url = $6
     WHERE id = $1
     RETURNING *`,
    [id, name, slug, description, base_price, image_url]
  );
  return rows[0] || null;
}

export async function deactivate(id) {
  const { rows } = await pool.query(
    `UPDATE products SET is_active = false WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

export async function createVariant({ product_id, size, color, stock }) {
  const { rows } = await pool.query(
    `INSERT INTO variants (product_id, size, color, stock)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [product_id, size, color, stock]
  );
  return rows[0];
}

export async function updateVariantStock(id, stock) {
  const { rows } = await pool.query(
    `UPDATE variants SET stock = $2 WHERE id = $1 RETURNING *`,
    [id, stock]
  );
  return rows[0] || null;
}

export async function findVariantsByProductId(productId) {
  const { rows } = await pool.query(
    'SELECT * FROM variants WHERE product_id = $1 ORDER BY color, size',
    [productId]
  );
  return rows;
}

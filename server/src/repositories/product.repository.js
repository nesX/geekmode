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

export async function create({ name, slug, description, base_price, image_url, search_keywords }) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, slug, description, base_price, image_url, search_keywords)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, slug, description, base_price, image_url, search_keywords || '']
  );
  return rows[0];
}

export async function update(id, { name, slug, description, base_price, image_url, search_keywords }) {
  const { rows } = await pool.query(
    `UPDATE products
     SET name = $2, slug = $3, description = $4, base_price = $5, image_url = $6, search_keywords = $7
     WHERE id = $1
     RETURNING *`,
    [id, name, slug, description, base_price, image_url, search_keywords || '']
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

// ── Search ──

export async function search(query, limit = 50) {
  const { rows } = await pool.query(`
    SELECT
      p.id, p.name, p.slug, p.base_price,
      COALESCE(pi.image_url, p.image_url) AS image_url,
      COALESCE(SUM(v.stock), 0)::int AS total_stock,
      ts_rank(p.search_vector, plainto_tsquery('spanish', $1)) AS rank
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    LEFT JOIN variants v ON v.product_id = p.id
    WHERE p.is_active = true
      AND p.search_vector @@ plainto_tsquery('spanish', $1)
    GROUP BY p.id, pi.image_url
    ORDER BY rank DESC, p.created_at DESC
    LIMIT $2
  `, [query, limit]);
  return rows;
}

// ── Home queries ──

export async function findNewest(limit = 8) {
  const { rows } = await pool.query(`
    SELECT
      p.id, p.name, p.slug, p.description, p.base_price,
      COALESCE(pi.image_url, p.image_url) AS image_url,
      COALESCE(SUM(v.stock), 0)::int AS total_stock
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    LEFT JOIN variants v ON v.product_id = p.id
    WHERE p.is_active = true
    GROUP BY p.id, pi.image_url
    ORDER BY p.created_at DESC
    LIMIT $1
  `, [limit]);
  return rows;
}

export async function findByCategoryId(categoryId, limit = 8) {
  const { rows } = await pool.query(`
    SELECT
      p.id, p.name, p.slug, p.description, p.base_price,
      COALESCE(pi.image_url, p.image_url) AS image_url,
      COALESCE(SUM(v.stock), 0)::int AS total_stock
    FROM products p
    JOIN product_categories pc ON pc.product_id = p.id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    LEFT JOIN variants v ON v.product_id = p.id
    WHERE pc.category_id = $1 AND p.is_active = true
    GROUP BY p.id, pi.image_url
    ORDER BY p.created_at DESC
    LIMIT $2
  `, [categoryId, limit]);
  return rows;
}

// ── Category relations ──

export async function setCategories(productId, categoryIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
    for (const categoryId of categoryIds) {
      await client.query(
        'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
        [productId, categoryId]
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

export async function findRelated(productId, categoryIds, limit = 5) {
  // Step 1: products sharing categories
  const { rows: related } = await pool.query(`
    SELECT p.id, p.name, p.slug, p.base_price,
           COALESCE(pi.image_url, p.image_url) AS image_url
    FROM products p
    JOIN product_categories pc ON pc.product_id = p.id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    WHERE pc.category_id = ANY($2) AND p.id != $1 AND p.is_active = true
    GROUP BY p.id, pi.image_url
    ORDER BY p.created_at DESC
    LIMIT $3
  `, [productId, categoryIds, limit]);

  if (related.length < limit) {
    const excludeIds = [productId, ...related.map(r => r.id)];
    const { rows: filler } = await pool.query(`
      SELECT p.id, p.name, p.slug, p.base_price,
             COALESCE(pi.image_url, p.image_url) AS image_url
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      WHERE p.id != ALL($1) AND p.is_active = true
      GROUP BY p.id, pi.image_url
      ORDER BY p.created_at DESC
      LIMIT $2
    `, [excludeIds, limit - related.length]);
    return [...related, ...filler];
  }

  return related;
}

export async function findCategoriesByProductId(productId) {
  const { rows } = await pool.query(
    `SELECT c.* FROM categories c
     JOIN product_categories pc ON pc.category_id = c.id
     WHERE pc.product_id = $1
     ORDER BY c.name ASC`,
    [productId]
  );
  return rows;
}

import pool from '../config/db.js';

export async function findAllActive() {
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.base_price,
      p.image_filename,
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
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('filename', pi.filename, 'alt_text', pi.alt_text, 'is_primary', pi.is_primary))
        FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) AS images,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', v.id, 'size', v.size, 'color', v.color, 'stock', v.stock))
        FILTER (WHERE v.id IS NOT NULL),
        '[]'
      ) AS variants,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
        FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    LEFT JOIN variants v ON v.product_id = p.id
    LEFT JOIN product_tags pt ON pt.product_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id AND t.is_active = true
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
      p.search_keywords,
      COALESCE(pi.filename, p.image_filename) AS image_filename,
      p.is_active,
      COALESCE(SUM(v.stock), 0)::int AS total_stock
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    LEFT JOIN variants v ON v.product_id = p.id
    GROUP BY p.id, pi.filename
    ORDER BY p.created_at DESC
  `);
  return rows;
}

export async function create({ name, slug, description, base_price, image_filename, search_keywords }) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, slug, description, base_price, image_filename, search_keywords)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, slug, description, base_price, image_filename, search_keywords || '']
  );
  return rows[0];
}

export async function update(id, { name, slug, description, base_price, image_filename, search_keywords }) {
  const { rows } = await pool.query(
    `UPDATE products
     SET name = $2, slug = $3, description = $4, base_price = $5, image_filename = $6, search_keywords = $7
     WHERE id = $1
     RETURNING *`,
    [id, name, slug, description, base_price, image_filename, search_keywords || '']
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
      COALESCE(pi.filename, p.image_filename) AS image_filename,
      COALESCE(SUM(v.stock), 0)::int AS total_stock,
      ts_rank(p.search_vector, plainto_tsquery('spanish', $1)) AS rank
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    LEFT JOIN variants v ON v.product_id = p.id
    WHERE p.is_active = true
      AND p.search_vector @@ plainto_tsquery('spanish', $1)
    GROUP BY p.id, pi.filename
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
      COALESCE(pi.filename, p.image_filename) AS image_filename,
      COALESCE(SUM(v.stock), 0)::int AS total_stock
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    LEFT JOIN variants v ON v.product_id = p.id
    WHERE p.is_active = true
    GROUP BY p.id, pi.filename
    ORDER BY p.created_at DESC
    LIMIT $1
  `, [limit]);
  return rows;
}

export async function findByCategoryId(categoryId, limit = 8) {
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
           COALESCE(pi.filename, p.image_filename) AS image_filename
    FROM products p
    JOIN product_categories pc ON pc.product_id = p.id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    WHERE pc.category_id = ANY($2) AND p.id != $1 AND p.is_active = true
    GROUP BY p.id, pi.filename
    ORDER BY p.created_at DESC
    LIMIT $3
  `, [productId, categoryIds, limit]);

  if (related.length < limit) {
    const excludeIds = [productId, ...related.map(r => r.id)];
    const { rows: filler } = await pool.query(`
      SELECT p.id, p.name, p.slug, p.base_price,
             COALESCE(pi.filename, p.image_filename) AS image_filename
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      WHERE p.id != ALL($1) AND p.is_active = true
      GROUP BY p.id, pi.filename
      ORDER BY p.created_at DESC
      LIMIT $2
    `, [excludeIds, limit - related.length]);
    return [...related, ...filler];
  }

  return related;
}

export async function setTags(productId, tagIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM product_tags WHERE product_id = $1', [productId]);
    for (const tagId of tagIds) {
      await client.query(
        'INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2)',
        [productId, tagId]
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

export async function findTagsByProductId(productId) {
  const { rows } = await pool.query(
    `SELECT t.* FROM tags t
     JOIN product_tags pt ON pt.tag_id = t.id
     WHERE pt.product_id = $1 AND t.is_active = true
     ORDER BY t.name ASC`,
    [productId]
  );
  return rows;
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

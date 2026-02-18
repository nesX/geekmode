import pool from '../config/db.js';

export async function findAll() {
  const { rows } = await pool.query(
    'SELECT key, value FROM site_settings ORDER BY key'
  );
  return rows;
}

export async function findByKey(key) {
  const { rows } = await pool.query(
    'SELECT value FROM site_settings WHERE key = $1',
    [key]
  );
  return rows[0]?.value || null;
}

export async function update(key, value) {
  const { rows } = await pool.query(
    'UPDATE site_settings SET value = $2 WHERE key = $1 RETURNING key, value',
    [key, value]
  );
  if (!rows[0]) throw new Error('SETTING_NOT_FOUND');
  return rows[0];
}

export async function createIfNotExists(key, value) {
  const { rows } = await pool.query(
    'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING RETURNING key, value',
    [key, value]
  );
  return rows[0] || null;
}

import pg from 'pg';
import { env } from './env.js';

const pool = new pg.Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.pass,
});

export default pool;

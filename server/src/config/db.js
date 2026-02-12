import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

let pool = null;

export const hasDbConfig = Boolean(env.db.user && env.db.password);

if (hasDbConfig) {
  pool = new Pool({
    user: env.db.user,
    host: env.db.host,
    database: env.db.database,
    password: env.db.password,
    port: env.db.port
  });
}

export { pool };

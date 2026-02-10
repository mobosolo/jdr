import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn('[server] DATABASE_URL is not set.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

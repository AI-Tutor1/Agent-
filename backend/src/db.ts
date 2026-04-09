import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://ahmedshaheer@localhost:5432/tuitional_wajeeha',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

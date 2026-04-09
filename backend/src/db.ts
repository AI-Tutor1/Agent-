import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const pool = new Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

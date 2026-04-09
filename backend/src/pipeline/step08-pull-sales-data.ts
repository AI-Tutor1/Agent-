// Step 8 — Pull Sales Data
// Type: Pure Code. Zero AI cost.

import { pool } from '../db';
import { SalesData } from './types';

export async function step8PullSalesData(demoId: string): Promise<SalesData | null> {
  const result = await pool.query<{
    conversion_status: string;
    sales_agent: string;
    sales_comments: string;
  }>(
    `SELECT conversion_status, sales_agent, sales_comments
     FROM demo_conversion_sales
     WHERE matched_demo_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [demoId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    conversion_status: row.conversion_status ?? null,
    sales_agent: row.sales_agent ?? null,
    sales_comments: row.sales_comments ?? null,
  };
}

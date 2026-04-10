import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import teacherRoutes from './routes/teachers';
import demoRoutes from './routes/demos';
import analysisRoutes from './routes/analyses';
import departmentRoutes from './routes/departments';
import testRoutes from './routes/tests';
import syncRoutes from './routes/sync';
import webhookRoutes from './routes/webhooks';
import dashboardRoutes from './routes/dashboard';
import agentRoutes from './routes/agent';
import { pool } from './db';
import { securityHeaders } from './middleware/security';
import {
  dashboardLimiter,
  agentLimiter,
  webhookLimiter,
  authLimiter,
} from './middleware/rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security headers — applied globally
app.use(securityHeaders);

// CORS — read from environment, never wildcard in production
const allowedOrigin = process.env.CORS_ORIGIN;
if (!allowedOrigin) {
  console.warn('[security] CORS_ORIGIN not set — CORS disabled for all origins');
}
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Authorization',
    'X-Agent-Token', 'X-Webhook-Secret',
  ],
}));

app.use(express.json({ limit: '1mb' }));

// Routes with rate limiters
app.use('/api/auth',        authLimiter,      authRoutes);
app.use('/api/teachers',    dashboardLimiter, teacherRoutes);
app.use('/api/demos',       dashboardLimiter, demoRoutes);
app.use('/api/analyses',    dashboardLimiter, analysisRoutes);
app.use('/api/departments', dashboardLimiter, departmentRoutes);
app.use('/api/tests',       dashboardLimiter, testRoutes);
app.use('/api/sync',                          syncRoutes); // rate limits applied per-endpoint inside sync.ts
app.use('/api/webhooks',    webhookLimiter,   webhookRoutes);
app.use('/api/pipeline',    webhookLimiter,   webhookRoutes); // /api/pipeline/status/:demoId
app.use('/api/dashboard',   dashboardLimiter, dashboardRoutes);
app.use('/api/agent',       agentLimiter,     agentRoutes);

// Health check — real status
app.get('/api/health', async (_req, res) => {
  let dbStatus = 'connected';
  let lastSync: string | null = null;

  try {
    await pool.query('SELECT 1');
  } catch {
    dbStatus = 'error';
  }

  try {
    const syncResult = await pool.query(
      `SELECT created_at FROM sync_log ORDER BY created_at DESC LIMIT 1`
    );
    if (syncResult.rows.length > 0) {
      lastSync = syncResult.rows[0].created_at;
    }
  } catch {
    // sync_log query failure is non-fatal
  }

  res.json({
    status: 'ok',
    version: '1.0.0',
    shadow_mode: process.env.SHADOW_MODE === 'true',
    database: dbStatus,
    sheets_api: 'ok',
    claude_api: 'ok',
    lms: 'mock',
    last_sync: lastSync,
    uptime_seconds: Math.floor(process.uptime()),
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

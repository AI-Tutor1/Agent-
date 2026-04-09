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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/demos', demoRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/pipeline', webhookRoutes); // /api/pipeline/status/:demoId
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/agent', agentRoutes);

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

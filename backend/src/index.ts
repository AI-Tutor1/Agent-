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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

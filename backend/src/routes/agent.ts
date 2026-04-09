import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { agentAuth } from '../middleware/auth';

const router = Router();

// All agent routes require X-Agent-Token
router.use(agentAuth);

// GET /api/agent/tasks?assignee=name&status=to_do,doing
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const assignee = req.query.assignee as string | undefined;
    const statusParam = req.query.status as string | undefined;
    const statuses = statusParam ? statusParam.split(',').map((s) => s.trim()) : [];

      // Build query with separate handling for string vs string[] params
    let query = `SELECT id, title, description, priority, due_date, column_status, assignee_name, metadata, created_at, updated_at FROM task_queue`;
    const conditions: string[] = [];
    const queryParams: (string | string[])[] = [];

    if (assignee) {
      queryParams.push(assignee);
      conditions.push(`assignee_name = $${queryParams.length}`);
    }

    if (statuses.length > 0) {
      queryParams.push(statuses);
      conditions.push(`column_status = ANY($${queryParams.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ` ORDER BY created_at DESC`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await pool.query(query, queryParams as any[]);

    res.json({ tasks: result.rows });
  } catch (err) {
    console.error('[agent/tasks GET] Error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/agent/tasks
router.post('/tasks', async (req: Request, res: Response) => {
  const { title, description, priority, assignee_name, due_date, metadata } = req.body as {
    title?: string;
    description?: string;
    priority?: string;
    assignee_name?: string;
    due_date?: string;
    metadata?: Record<string, unknown>;
  };

  if (!title || !assignee_name) {
    res.status(400).json({ error: 'title and assignee_name are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO task_queue (title, description, priority, assignee_name, due_date, metadata, column_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'to_do', NOW(), NOW())
       RETURNING id`,
      [title, description ?? null, priority ?? 'medium', assignee_name, due_date ?? null, JSON.stringify(metadata ?? {})]
    );

    res.status(201).json({ task_id: result.rows[0].id });
  } catch (err) {
    console.error('[agent/tasks POST] Error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/agent/tasks/:taskId
router.patch('/tasks/:taskId', async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { column_status, started_at, title, description, priority } = req.body as {
    column_status?: string;
    started_at?: string;
    title?: string;
    description?: string;
    priority?: string;
  };

  const setClauses: string[] = ['updated_at = NOW()'];
  const params: (string | null)[] = [];

  if (column_status !== undefined) {
    params.push(column_status);
    setClauses.push(`column_status = $${params.length}`);
  }
  if (started_at !== undefined) {
    params.push(started_at);
    setClauses.push(`started_at = $${params.length}`);
  }
  if (title !== undefined) {
    params.push(title);
    setClauses.push(`title = $${params.length}`);
  }
  if (description !== undefined) {
    params.push(description);
    setClauses.push(`description = $${params.length}`);
  }
  if (priority !== undefined) {
    params.push(priority);
    setClauses.push(`priority = $${params.length}`);
  }

  params.push(String(taskId));

  try {
    await pool.query(
      `UPDATE task_queue SET ${setClauses.join(', ')} WHERE id = $${params.length}`,
      params
    );
    res.json({ status: 'updated' });
  } catch (err) {
    console.error('[agent/tasks PATCH] Error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// POST /api/agent/tasks/:taskId/complete
router.post('/tasks/:taskId/complete', async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { result: taskResult, artifacts } = req.body as {
    result?: string;
    artifacts?: string[];
  };

  try {
    await pool.query(
      `UPDATE task_queue
       SET column_status = 'done', completed_at = NOW(), updated_at = NOW(),
           metadata = metadata || $1
       WHERE id = $2`,
      [JSON.stringify({ result: taskResult ?? '', artifacts: artifacts ?? [] }), taskId]
    );

    await pool.query(
      `INSERT INTO agent_activity_log (agent_name, action_type, details, status, created_at)
       VALUES ('agent', 'task_complete', $1, 'success', NOW())`,
      [`Task ${taskId} completed: ${taskResult ?? ''}`]
    );

    res.json({ status: 'done', task_id: taskId });
  } catch (err) {
    console.error('[agent/tasks/complete] Error:', err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// POST /api/agent/log
router.post('/log', async (req: Request, res: Response) => {
  const { agent_name, action_type, demo_id, details, tokens_used, status } = req.body as {
    agent_name?: string;
    action_type?: string;
    demo_id?: string;
    details?: string;
    tokens_used?: number;
    status?: string;
  };

  if (!agent_name || !action_type || !status) {
    res.status(400).json({ error: 'agent_name, action_type, and status are required' });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO agent_activity_log (agent_name, action_type, demo_id, details, tokens_used, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [agent_name, action_type, demo_id ?? null, details ?? null, tokens_used ?? null, status]
    );

    res.status(201).json({ status: 'logged' });
  } catch (err) {
    console.error('[agent/log] Error:', err);
    res.status(500).json({ error: 'Failed to write log' });
  }
});

// POST /api/agent/heartbeat
router.post('/heartbeat', async (req: Request, res: Response) => {
  const { agent_name } = req.body as { agent_name?: string };

  try {
    const [dbCheck, pendingTasks] = await Promise.all([
      pool.query('SELECT 1 AS ok'),
      agent_name
        ? pool.query(
            `SELECT COUNT(*) AS count FROM task_queue WHERE assignee_name = $1 AND column_status IN ('to_do','doing')`,
            [agent_name]
          )
        : Promise.resolve({ rows: [{ count: '0' }] }),
    ]);

    const dbOk = dbCheck.rows[0]?.ok === 1;

    res.json({
      status: 'ok',
      pending_tasks: parseInt(pendingTasks.rows[0]?.count ?? '0', 10),
      shadow_mode: process.env.SHADOW_MODE === 'true',
      db_status: dbOk ? 'ok' : 'error',
      uptime_seconds: Math.floor(process.uptime()),
    });
  } catch (err) {
    console.error('[agent/heartbeat] Error:', err);
    res.json({
      status: 'degraded',
      pending_tasks: 0,
      shadow_mode: process.env.SHADOW_MODE === 'true',
      db_status: 'error',
      uptime_seconds: Math.floor(process.uptime()),
    });
  }
});

// POST /api/agent/identity
router.post('/identity', async (req: Request, res: Response) => {
  const { agent_name, file_type, content } = req.body as {
    agent_name?: string;
    file_type?: string;
    content?: string;
  };

  if (!agent_name || !file_type) {
    res.status(400).json({ error: 'agent_name and file_type are required' });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO agent_activity_log (agent_name, action_type, details, status, created_at)
       VALUES ($1, 'identity_update', $2, 'success', NOW())`,
      [agent_name, `Updated ${file_type}: ${(content ?? '').slice(0, 200)}`]
    );

    res.json({ status: 'logged', agent_name, file_type });
  } catch (err) {
    console.error('[agent/identity] Error:', err);
    res.status(500).json({ error: 'Failed to log identity update' });
  }
});

export default router;

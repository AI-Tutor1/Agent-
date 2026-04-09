import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, head_name AS head, head_agent_name, total_agents, active_agents
       FROM departments
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, head_name AS head, head_agent_name, total_agents, active_agents
       FROM departments
       WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching department:', err);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

export default router;

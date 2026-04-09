import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name AS name, role, department AS dept
       FROM user_profiles
       ORDER BY full_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/login', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }
  try {
    const result = await pool.query(
      `SELECT id, full_name AS name, role, department AS dept
       FROM user_profiles
       WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

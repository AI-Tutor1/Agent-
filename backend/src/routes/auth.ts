import { Router } from 'express';
import { pool } from '../db';
import { MOCK_USERS } from '../data/mock';

const router = Router();

router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id AS id, name, role, dept FROM platform_users WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows.length > 0 ? result.rows : MOCK_USERS);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.json(MOCK_USERS);
  }
});

router.post('/login', async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await pool.query(
      'SELECT user_id AS id, name, role, dept FROM platform_users WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
      return;
    }
    // Fallback to mock
    const mockUser = MOCK_USERS.find(u => u.id === userId);
    if (mockUser) {
      res.json(mockUser);
      return;
    }
    res.status(401).json({ error: 'User not found' });
  } catch (err) {
    console.error('Error during login:', err);
    const mockUser = MOCK_USERS.find(u => u.id === userId);
    if (mockUser) {
      res.json(mockUser);
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

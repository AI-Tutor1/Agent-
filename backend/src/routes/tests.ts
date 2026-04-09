import { Router } from 'express';

const router = Router();

// Tests are TuAI educational content — not in scope for this system.
// Returns empty arrays until a tests table is added to the schema.
router.get('/', (_req, res) => {
  res.json([]);
});

router.get('/:id', (req, res) => {
  res.status(404).json({ error: 'Test not found' });
});

export default router;

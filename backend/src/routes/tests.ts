import { Router } from 'express';
import { mockTests } from '../data/mockTests';

const router = Router();

// Tests are educational content — kept as mock for now
// Will be DB-backed when test creation is fully implemented
router.get('/', (_req, res) => {
  res.json(mockTests);
});

router.get('/:id', (req, res) => {
  const test = mockTests.find(t => t.id === req.params.id);
  if (!test) {
    res.status(404).json({ error: 'Test not found' });
    return;
  }
  res.json(test);
});

export default router;

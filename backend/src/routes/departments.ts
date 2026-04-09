import { Router } from 'express';
import { DEPARTMENTS } from '../data/mock';

const router = Router();

// Departments are organizational structure — kept as config data
// Can be moved to DB later when department management is needed
router.get('/', (_req, res) => {
  res.json(DEPARTMENTS);
});

router.get('/:id', (req, res) => {
  const dept = DEPARTMENTS.find(d => d.id === req.params.id);
  if (!dept) {
    res.status(404).json({ error: 'Department not found' });
    return;
  }
  res.json(dept);
});

export default router;

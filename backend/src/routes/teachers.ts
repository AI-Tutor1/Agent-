import { Router } from 'express';
import { pool } from '../db';
import {
  TEACHERS,
  ALL_SUBJECTS,
  ACADEMIC_LEVELS,
  CURRICULUM_BOARDS,
  RATE_TIERS,
  CURRICULUM_HINTS,
} from '../data/mock';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT teacher_name AS name, subjects
       FROM teacher_profiles
       WHERE status = 'active'
       ORDER BY teacher_name`
    );
    if (result.rows.length > 0) {
      const teachers = result.rows.map(r => ({
        name: r.name,
        subjects: r.subjects || [],
      }));
      res.json(teachers);
      return;
    }
    res.json(TEACHERS);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.json(TEACHERS);
  }
});

router.get('/subjects', (_req, res) => {
  res.json(ALL_SUBJECTS);
});

router.get('/academic-levels', (_req, res) => {
  res.json(ACADEMIC_LEVELS);
});

router.get('/curriculum-boards', (_req, res) => {
  res.json(CURRICULUM_BOARDS);
});

router.get('/rate-tiers', (_req, res) => {
  res.json(RATE_TIERS);
});

router.get('/curriculum-hints', (_req, res) => {
  res.json(CURRICULUM_HINTS);
});

export default router;

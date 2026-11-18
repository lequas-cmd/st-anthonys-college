import { Router } from 'express';
import { pool } from '../../config/database.js';

const router = Router();

const slugify = (value = '') => value
  .toString()
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

const normalizeProgram = (row) => ({
  id: Number(row.id),
  code: row.code,
  title: row.name,
  category: row.department || 'General Studies',
  qualification_level: row.qualification_level || 'Level I',
  duration_years: Number(row.duration_years ?? 2),
  duration: `${Number(row.duration_years ?? 2)} years`,
  description: row.description || 'No program description available yet.',
  image_url: row.image_url || null,
  is_active: Boolean(row.is_active),
});

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, code, name, department, qualification_level, duration_years, description, image_url, is_active
      FROM programs
      WHERE is_active = 1
      ORDER BY name ASC
    `);

    res.json({
      programs: rows.map(normalizeProgram),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, code, name, department, qualification_level, duration_years, description, image_url, is_active
      FROM programs
      WHERE is_active = 1
      ORDER BY name ASC
    `);

    const program = rows.find((row) => slugify(row.name) === req.params.slug);

    if (!program) {
      return res.status(404).json({ message: 'Program not found.' });
    }

    return res.json({ program: normalizeProgram(program) });
  } catch (error) {
    return next(error);
  }
});

export default router;

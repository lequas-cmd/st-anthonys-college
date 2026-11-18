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

const formatDate = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const normalizeAnnouncement = (row) => ({
  id: Number(row.id),
  title: row.title,
  slug: slugify(row.title),
  audience: row.audience || 'everyone',
  summary: row.summary || row.body?.replace(/<[^>]*>/g, '').slice(0, 180) || 'No announcement summary available yet.',
  body: row.body || 'No announcement content available yet.',
  published_at: row.published_at || row.created_at,
  date: formatDate(row.published_at || row.created_at),
});

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title, body, audience, status, published_at, created_at
      FROM announcements
      WHERE status = 'published' AND audience = 'everyone'
      ORDER BY published_at DESC, created_at DESC
    `);

    res.json({ announcements: rows.map(normalizeAnnouncement) });
  } catch (error) {
    next(error);
  }
});

export default router;

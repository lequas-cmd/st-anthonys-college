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

const normalizeEvent = (row) => {
  const startsAt = row.starts_at ? new Date(row.starts_at) : null;
  const endsAt = row.ends_at ? new Date(row.ends_at) : null;

  return {
    id: Number(row.id),
    title: row.title,
    slug: row.slug || slugify(row.title),
    summary: row.summary || 'No event summary available yet.',
    body: row.body || row.summary || 'No event description is available yet.',
    location: row.location || 'College campus',
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    image_url: row.image_url || null,
    startsAt: startsAt ? startsAt.toISOString() : null,
    endsAt: endsAt ? endsAt.toISOString() : null,
    dateLabel: startsAt ? new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(startsAt) : 'Upcoming',
    month: startsAt ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(startsAt) : 'TBD',
    day: startsAt ? new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(startsAt) : '—',
  };
};

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title, slug, summary, body, location, starts_at, ends_at, image_url, status, created_at
      FROM events
      WHERE status = 'published'
      ORDER BY starts_at ASC, created_at DESC
    `);

    res.json({ events: rows.map(normalizeEvent) });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title, slug, summary, body, location, starts_at, ends_at, image_url, status, created_at
      FROM events
      WHERE status = 'published'
      ORDER BY starts_at ASC, created_at DESC
    `);

    const event = rows.find((row) => (row.slug || slugify(row.title)) === req.params.slug);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    return res.json({ event: normalizeEvent(event) });
  } catch (error) {
    return next(error);
  }
});

export default router;

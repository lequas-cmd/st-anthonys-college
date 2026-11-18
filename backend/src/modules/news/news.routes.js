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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const normalizeNews = (row) => ({
  id: Number(row.id),
  title: row.title,
  slug: row.slug || slugify(row.title),
  category: 'Institutional news',
  summary: row.summary || row.body?.replace(/<[^>]*>/g, '').slice(0, 180) || 'No summary available yet.',
  body: row.body || row.summary || 'No article content available yet.',
  image_url: row.image_url || null,
  published_at: row.published_at || row.created_at,
  date: formatDate(row.published_at || row.created_at),
});

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title, slug, summary, body, image_url, status, published_at, created_at
      FROM news_articles
      WHERE status = 'published'
      ORDER BY published_at DESC, created_at DESC
    `);

    res.json({ news: rows.map(normalizeNews) });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title, slug, summary, body, image_url, status, published_at, created_at
      FROM news_articles
      WHERE status = 'published'
      ORDER BY published_at DESC, created_at DESC
    `);

    const article = rows.find((row) => (row.slug || slugify(row.title)) === req.params.slug);

    if (!article) {
      return res.status(404).json({ message: 'News article not found.' });
    }

    return res.json({ article: normalizeNews(article) });
  } catch (error) {
    return next(error);
  }
});

export default router;

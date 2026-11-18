import { Router } from 'express';
import { checkDatabaseConnection } from '../../config/database.js';

const router = Router();
router.get('/', async (_req, res) => {
  try {
    await checkDatabaseConnection();
    return res.json({ status: 'ok', api: 'up', database: 'up' });
  } catch {
    return res.status(503).json({ status: 'degraded', api: 'up', database: 'down' });
  }
});
export default router;

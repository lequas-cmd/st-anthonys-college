import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './modules/auth/auth.routes.js';
import healthRoutes from './modules/health/health.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import adminCrudRoutes from './modules/dashboard/admin-crud.routes.js';
import programsRoutes from './modules/programs/programs.routes.js';
import newsRoutes from './modules/news/news.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import announcementsRoutes from './modules/announcements/announcements.routes.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.frontendOrigin.split(',').map((origin) => origin.trim()), credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/', (_req, res) => res.json({ name: "Saint Anthony's College API", version: '1.0.0' }));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard/admin', adminCrudRoutes);
app.use((_req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: env.nodeEnv === 'production' ? 'An unexpected server error occurred.' : error.message });
});

export default app;

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database.js';
import { env } from '../../config/env.js';
import { authenticate } from '../../middleware/authenticate.js';
import { createUserSession, writeAuditLog } from '../../utils/audit.js';

const router = Router();
const validRoles = new Set(['admin', 'teacher', 'student', 'registrar', 'department_head', 'academic_coordinator', 'librarian', 'admissions_officer']);

router.post('/login', async (req, res, next) => {
  try {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!username || !password || username.length > 100 || password.length > 200) {
      return res.status(400).json({ message: 'Enter a valid username and password.' });
    }

    const [rows] = await pool.execute(
      'SELECT id, username, password_hash, role, is_active FROM users WHERE username = ? LIMIT 1',
      [username],
    );
    const user = rows[0];
    if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    if (!validRoles.has(user.role)) {
      return res.status(403).json({ message: 'This account has an unsupported role.' });
    }

    const token = jwt.sign({ sub: String(user.id), username: user.username, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

    await createUserSession({
      userId: user.id,
      token,
      request: req,
    });

    await writeAuditLog({
      actorUserId: user.id,
      userId: user.id,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      details: { username: user.username, role: user.role },
      request: req,
    });

    await pool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) { return next(error); }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, role FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
      [req.user.sub],
    );
    if (!rows[0]) return res.status(401).json({ message: 'Account not found or inactive.' });
    return res.json({ user: rows[0] });
  } catch (error) { return next(error); }
});

export default router;

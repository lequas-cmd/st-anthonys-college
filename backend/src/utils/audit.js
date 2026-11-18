import { pool } from '../config/database.js';

export async function writeAuditLog({
  actorUserId = null,
  userId = null,
  action,
  entityType,
  entityId = null,
  details = {},
  request = null,
}) {
  if (!action || !entityType) {
    return null;
  }

  const detailsPayload = typeof details === 'string' ? details : JSON.stringify(details ?? {});
  const ipAddress = request?.ip ?? null;
  const userAgent = request?.headers?.['user-agent'] ?? null;

  const [result] = await pool.execute(
    `INSERT INTO audit_logs (actor_user_id, user_id, action, entity_type, entity_id, details, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [actorUserId, userId, action, entityType, entityId, detailsPayload, ipAddress, userAgent],
  );

  return result.insertId;
}

export async function createUserSession({ userId, token, request = null }) {
  if (!userId || !token) {
    return null;
  }

  const crypto = await import('node:crypto');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const [result] = await pool.execute(
    `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, login_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [userId, tokenHash, request?.ip ?? null, request?.headers?.['user-agent'] ?? null],
  );

  return result.insertId;
}

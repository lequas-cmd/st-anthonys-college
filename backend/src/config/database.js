import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationPath = path.resolve(__dirname, '..', '..', 'database', 'additive-migration.sql');

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'saint_anthonys_college',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

export async function checkDatabaseConnection() {
  const connection = await pool.getConnection();
  try { await connection.ping(); } finally { connection.release(); }
}

export async function applyAdditiveMigrations() {
  if (!fs.existsSync(migrationPath)) {
    return;
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  const statements = sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
    .filter((statement) => !statement.startsWith('--'));

  if (!statements.length) {
    return;
  }

  const connection = await pool.getConnection();
  try {
    for (const statement of statements) {
      if (!statement || statement.startsWith('USE ')) continue;

      try {
        await connection.query(statement);
      } catch (error) {
        const code = Number(error?.errno ?? error?.code ?? 0);
        const message = String(error?.message ?? '');
        const isAlreadyAppliedMigrationError = [1060, 1061, 1062, 1091, 121].includes(code)
          || /duplicate key|already exists|constraint.*exists/i.test(message);

        if (isAlreadyAppliedMigrationError) {
          continue;
        }

        throw error;
      }
    }
  } finally {
    connection.release();
  }
}

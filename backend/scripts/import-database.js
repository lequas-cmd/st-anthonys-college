import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sqlFile = path.join(rootDir, 'database', 'saint_anthonys_college_full_database.sql');

if (!fs.existsSync(sqlFile)) {
  console.error(`Database dump not found: ${sqlFile}`);
  process.exit(1);
}

const dbHost = process.env.DB_HOST ?? '127.0.0.1';
const dbPort = process.env.DB_PORT ?? '3306';
const dbUser = process.env.DB_USER ?? 'root';
const dbPassword = process.env.DB_PASSWORD ?? '';
const dbName = process.env.DB_NAME ?? 'saint_anthonys_college';

const mysqlBin = process.platform === 'win32' ? 'mysql.exe' : 'mysql';
const commandArgs = [
  `--host=${dbHost}`,
  `--port=${dbPort}`,
  `--user=${dbUser}`,
  `--database=${dbName}`,
  '--default-character-set=utf8mb4',
];

if (dbPassword) {
  commandArgs.push(`--password=${dbPassword}`);
}

const result = spawnSync(mysqlBin, commandArgs, {
  input: fs.readFileSync(sqlFile, 'utf8'),
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error('Unable to run mysql client. Please make sure MySQL is installed and available in PATH.');
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`MySQL import failed with exit code ${result.status}.`);
  process.exit(result.status ?? 1);
}

console.log(`Database imported from ${path.relative(rootDir, sqlFile)} into ${dbName}.`);

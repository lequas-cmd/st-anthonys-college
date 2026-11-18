import app from './app.js';
import { applyAdditiveMigrations, checkDatabaseConnection } from './config/database.js';
import { env } from './config/env.js';

let server;

async function startServer() {
  await checkDatabaseConnection();
  await applyAdditiveMigrations();
  server = app.listen(env.port, () => {
    console.log(`College API listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start API server:', error.message);
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing HTTP server...`);
  if (server) {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
    return;
  }
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

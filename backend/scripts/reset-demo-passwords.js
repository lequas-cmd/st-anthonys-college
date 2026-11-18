import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';

// Development helper: resets only the seeded demo accounts.
// Do not run this against production data.
const demoPassword = process.env.DEMO_PASSWORD || 'Demo@12345';

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to reset demo passwords when NODE_ENV=production.');
  process.exitCode = 1;
} else {
  try {
    const passwordHash = await bcrypt.hash(demoPassword, 12);
    const [result] = await pool.execute(
      `UPDATE users
       SET password_hash = ?
       WHERE username = 'demo_admin'
          OR username REGEXP '^demo_teacher[0-9]{2}$'
          OR username REGEXP '^demo_student[0-9]{2}$'`,
      [passwordHash],
    );

    console.log(`Updated ${result.affectedRows} demo account(s).`);
    console.log('Username examples: demo_admin, demo_teacher01, demo_student01');
    console.log('Use the DEMO_PASSWORD value shown in your command, or Demo@12345 if you did not override it.');
  } catch (error) {
    console.error('Could not reset demo passwords:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

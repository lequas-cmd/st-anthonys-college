import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'saint_anthonys_college',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  waitForConnections: true,
  connectionLimit: 10,
});

const seedData = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingUsers] = await connection.query('SELECT id, username, role FROM users ORDER BY id ASC');
    const admin = existingUsers.find((user) => user.role === 'admin') ?? existingUsers[0] ?? null;
    let teacherIds = existingUsers.filter((user) => user.role === 'teacher').slice(0, 4).map((user) => user.id);
    const studentIds = existingUsers.filter((user) => user.role === 'student').slice(0, 8).map((user) => user.id);

    if (!admin) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const [adminInsert] = await connection.execute(
        'INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
        ['demo_admin', passwordHash, 'admin'],
      );
      admin = { id: adminInsert.insertId, username: 'demo_admin', role: 'admin' };
    }

    if (teacherIds.length === 0) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const teacherRows = [
        ['demo_teacher01', 'Mary', 'Owusu'],
        ['demo_teacher02', 'Charles', 'Nkrumah'],
        ['demo_teacher03', 'Aisha', 'Koomson'],
      ];
      for (const [username, firstName, lastName] of teacherRows) {
        const [teacherInsert] = await connection.execute(
          'INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
          [username, passwordHash, 'teacher'],
        );
        await connection.execute(
          'INSERT INTO teachers (user_id, employee_number, first_name, last_name, department, status) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE department = VALUES(department)',
          [teacherInsert.insertId, `TE-${teacherInsert.insertId}`, firstName, lastName, 'Academic Affairs', 'active'],
        );
      }
    }

    if (studentIds.length === 0) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const studentRows = [
        ['demo_student01', 'Kwame', 'Boateng'],
        ['demo_student02', 'Abena', 'Mensah'],
        ['demo_student03', 'Esi', 'Annan'],
        ['demo_student04', 'Kojo', 'Darko'],
      ];
      for (const [username, firstName, lastName] of studentRows) {
        const [studentInsert] = await connection.execute(
          'INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
          [username, passwordHash, 'student'],
        );
        await connection.execute(
          'INSERT INTO students (user_id, student_number, first_name, last_name, program, program_id, enrollment_year, status, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE program = VALUES(program)',
          [studentInsert.insertId, `ST-${studentInsert.insertId}`, firstName, lastName, 'Information Technology', null, 2026, 'active', `${firstName.toLowerCase()}.${lastName.toLowerCase()}@college.edu`],
        );
      }
    }

    const [teacherRows] = await connection.query('SELECT id FROM teachers ORDER BY id ASC LIMIT 10');
    teacherIds = teacherRows.map((row) => row.id);

    const [programs] = await connection.query('SELECT id, name FROM programs ORDER BY id ASC LIMIT 10');
    if (programs.length) {
      await connection.execute(
        `INSERT INTO departments (name, code, head_staff_id)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE code = VALUES(code)`,
        ['Academic Affairs', 'ACD', teacherIds[0] ? teacherIds[0] : null],
      );
    }

    await connection.execute(
      `INSERT INTO role_permissions (role_name, resource, action)
       VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)
       ON DUPLICATE KEY UPDATE resource = VALUES(resource)` ,
      ['admin', 'dashboard', 'view', 'teacher', 'dashboard', 'view', 'student', 'dashboard', 'view'],
    );

    await connection.execute(
      `INSERT INTO academic_calendar_events (title, event_type, starts_at, ends_at, location, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Orientation Week', 'orientation', new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '), new Date(Date.now() + 90000000).toISOString().slice(0, 19).replace('T', ' '), 'Main Hall', admin.id],
    );

    await connection.execute(
      `INSERT INTO document_templates (template_name, template_type, body_html, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE body_html = VALUES(body_html)`,
      ['Student Welcome Letter', 'student_welcome', '<p>Welcome to Saint Anthony’s College.</p>', admin.id],
    );

    await connection.execute(
      `INSERT INTO classroom_resources (classroom_id, resource_type, name, quantity, status)
       VALUES (NULL, ?, ?, ?, ?)`,
      ['projector', 'HD Projector', 4, 'available'],
    );

    await connection.execute(
      `INSERT INTO staff_leave_requests (staff_id, leave_type, start_date, end_date, status, reason)
       VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'pending', ?)`,
      [teacherIds[0] ?? 1, 'annual', 'Medical checks and study leave'],
    );

    await connection.execute(
      `INSERT INTO audit_logs (actor_user_id, user_id, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [admin.id, admin.id, 'seed_run', 'system', 1, JSON.stringify({ source: 'seed-demo-data.js', note: 'Initial operational baseline created.' })],
    );

    await connection.commit();
    console.log('Seed data added successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

seedData();

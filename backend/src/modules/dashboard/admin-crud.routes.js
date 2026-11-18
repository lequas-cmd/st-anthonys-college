import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../../config/database.js';
import { authenticate, allowRoles } from '../../middleware/authenticate.js';
import { writeAuditLog } from '../../utils/audit.js';

const router = Router();
router.use(authenticate, allowRoles('admin'));

const asText = (value, field) => {
  if (typeof value !== 'string') {
    throw new Error(`${field} is required.`);
  }
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} is required.`);
  }
  return normalized;
};

const asPositiveInteger = (value, field, fallback) => {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${field} must be a positive number.`);
  }
  return parsed;
};

const usernameFromName = (first, last, fallback) => {
  const base = `${first}.${last}`.toLowerCase().replace(/[^a-z0-9.]/g, '');
  return base || fallback;
};

router.delete('/students/:studentNumber', async (req, res, next) => {
  try {
    const studentNumber = decodeURIComponent(req.params.studentNumber);
    const [rows] = await pool.execute('SELECT id, user_id FROM students WHERE student_number = ? LIMIT 1', [studentNumber]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    await pool.execute('DELETE FROM students WHERE id = ?', [rows[0].id]);
    await writeAuditLog({
      actorUserId: req.user.sub,
      userId: rows[0].user_id,
      action: 'student_deleted',
      entityType: 'student',
      entityId: rows[0].id,
      details: { student_number: studentNumber },
      request: req,
    });

    return res.json({ deleted: true, student_number: studentNumber });
  } catch (error) {
    return next(error);
  }
});

const teacherSelectSql = `
  SELECT t.id, t.user_id, t.employee_number, t.first_name, t.last_name, t.department, t.department_id,
         d.name AS department_name, d.code AS department_code,
         t.phone, t.email, t.hire_date, t.status, t.photo_url, t.created_at
  FROM teachers t
  LEFT JOIN departments d ON d.department_id = t.department_id
`;

router.post('/teachers', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const firstName = asText(b.first_name, 'First name');
    const lastName = asText(b.last_name, 'Last name');
    const employeeNumber = asText(b.employee_number ?? `TE-${Date.now()}`, 'Employee number');
    const department = b.department ? String(b.department).trim() : 'Department review';
    const username = asText(b.username ?? usernameFromName(firstName, lastName, employeeNumber), 'Username');
    const password = asText(b.password ?? 'Password123!', 'Password');

    const bcrypt = await import('bcryptjs');
    const [userInsert] = await pool.execute(
      'INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
      [username, await bcrypt.default.hash(password, 10), 'teacher'],
    );

    const [result] = await pool.execute(
      `INSERT INTO teachers (user_id, employee_number, first_name, last_name, department, department_id, phone, email, hire_date, status, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userInsert.insertId, employeeNumber, firstName, lastName, department, b.department_id || null,
       b.phone || null, b.email || null, b.hire_date || null, b.status || 'active', b.photo_url || null],
    );

    await writeAuditLog({
      actorUserId: req.user.sub, userId: userInsert.insertId, action: 'teacher_created',
      entityType: 'teacher', entityId: result.insertId, details: { employee_number: employeeNumber, name: `${firstName} ${lastName}` }, request: req,
    });

    const [rows] = await pool.query(`${teacherSelectSql} WHERE t.id = ? LIMIT 1`, [result.insertId]);
    res.status(201).json({ teacher: rows[0] });
  } catch (error) { next(error); }
});

router.delete('/teachers/:employeeNumber', async (req, res, next) => {
  try {
    const employeeNumber = decodeURIComponent(req.params.employeeNumber);
    const [rows] = await pool.execute('SELECT id, user_id FROM teachers WHERE employee_number = ? LIMIT 1', [employeeNumber]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    await pool.execute('DELETE FROM teachers WHERE id = ?', [rows[0].id]);
    await writeAuditLog({
      actorUserId: req.user.sub,
      userId: rows[0].user_id,
      action: 'teacher_deleted',
      entityType: 'teacher',
      entityId: rows[0].id,
      details: { employee_number: employeeNumber },
      request: req,
    });

    return res.json({ deleted: true, employee_number: employeeNumber });
  } catch (error) {
    return next(error);
  }
});

router.post('/programs', async (req, res, next) => {
  try {
    const code = asText(req.body?.code ?? `PRG-${Date.now()}`, 'Program code');
    const title = asText(req.body?.title, 'Program title');
    const department = asText(req.body?.department ?? 'General Studies', 'Department');
    const qualificationLevel = asText(req.body?.qualification_level ?? 'Level I', 'Qualification level');
    const durationYears = asPositiveInteger(req.body?.duration_years ?? 2, 'Duration years', 2);
    const description = asText(req.body?.description ?? `${title} program.`, 'Description');

    const [result] = await pool.execute(
      'INSERT INTO programs (code, name, department, qualification_level, duration_years, description, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [code, title, department, qualificationLevel, durationYears, description],
    );

    const [rows] = await pool.execute(
      'SELECT id, code, name, department, qualification_level, duration_years, description, is_active FROM programs WHERE id = ? LIMIT 1',
      [result.insertId],
    );

    await writeAuditLog({
      actorUserId: req.user.sub,
      action: 'program_created',
      entityType: 'program',
      entityId: result.insertId,
      details: { code, name: title, department },
      request: req,
    });

    return res.status(201).json({ program: rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.delete('/programs/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: 'Program id must be a positive number.' });
    }

    const [rows] = await pool.execute('SELECT id, code, name FROM programs WHERE id = ? LIMIT 1', [id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Program not found.' });
    }

    await pool.execute('DELETE FROM programs WHERE id = ?', [id]);
    await writeAuditLog({
      actorUserId: req.user.sub,
      action: 'program_deleted',
      entityType: 'program',
      entityId: rows[0].id,
      details: { code: rows[0].code, name: rows[0].name },
      request: req,
    });

    return res.json({ deleted: true, id });
  } catch (error) {
    return next(error);
  }
});

// ---------- Students: list, profile, update, status, import ----------

const studentSelectSql = `
  SELECT s.id, s.user_id, s.student_number, s.first_name, s.middle_name, s.last_name,
         s.program, s.program_id, p.name AS program_name, p.department AS program_department,
         p.department_id, d.name AS department_name, d.code AS department_code,
         s.enrollment_year, s.class_group_id, cg.group_name AS class_group_name,
         s.date_of_birth, s.gender, s.phone, s.email, s.address, s.status, s.photo_url,
         s.created_at
  FROM students s
  LEFT JOIN programs p ON p.id = s.program_id
  LEFT JOIN departments d ON d.department_id = p.department_id
  LEFT JOIN class_groups cg ON cg.class_group_id = s.class_group_id
`;

router.get('/students', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const programId = req.query.program_id ? Number(req.query.program_id) : null;
    const departmentId = req.query.department_id ? Number(req.query.department_id) : null;
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 100)));
    const offset = Math.max(0, Number(req.query.offset ?? 0));

    const conditions = [];
    const params = [];
    if (search) {
      conditions.push('(s.student_number LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }
    if (status) { conditions.push('s.status = ?'); params.push(status); }
    if (programId) { conditions.push('s.program_id = ?'); params.push(programId); }
    if (departmentId) { conditions.push('p.department_id = ?'); params.push(departmentId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `${studentSelectSql} ${where} ORDER BY s.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM students s LEFT JOIN programs p ON p.id = s.program_id ${where}`, params);

    res.json({
      students: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        studentNumber: r.student_number,
        firstName: r.first_name,
        middleName: r.middle_name,
        lastName: r.last_name,
        name: `${r.first_name} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name}`.trim(),
        program: r.program_name || r.program || 'Not assigned',
        programId: r.program_id,
        programDepartment: r.program_department,
        departmentId: r.department_id,
        departmentName: r.department_name || r.program_department || null,
        departmentCode: r.department_code,
        enrollmentYear: r.enrollment_year,
        classGroupId: r.class_group_id,
        classGroupName: r.class_group_name,
        dateOfBirth: r.date_of_birth,
        gender: r.gender,
        phone: r.phone,
        email: r.email,
        address: r.address,
        status: r.status,
        photoUrl: r.photo_url,
        createdAt: r.created_at,
      })),
      total: Number(countRow.total),
      limit,
      offset,
    });
  } catch (error) { next(error); }
});

router.get('/students/:studentNumber', async (req, res, next) => {
  try {
    const studentNumber = decodeURIComponent(req.params.studentNumber);
    const [rows] = await pool.query(`${studentSelectSql} WHERE s.student_number = ? LIMIT 1`, [studentNumber]);
    if (!rows[0]) return res.status(404).json({ message: 'Student not found.' });
    const r = rows[0];
    const [enrollments] = await pool.query(`
      SELECT sae.academic_enrollment_id, sae.program_id, p.name AS program_name, sae.academic_year_id,
             ay.name AS academic_year_name, sae.class_group_id, cg.group_name, sae.level_number,
             sae.enrollment_status, sae.start_date, sae.end_date, sae.notes
      FROM student_academic_enrollments sae
      LEFT JOIN programs p ON p.id = sae.program_id
      LEFT JOIN academic_years ay ON ay.id = sae.academic_year_id
      LEFT JOIN class_groups cg ON cg.class_group_id = sae.class_group_id
      WHERE sae.student_id = ?
      ORDER BY sae.created_at DESC
    `, [r.id]);
    res.json({
      student: {
        id: r.id, userId: r.user_id, studentNumber: r.student_number,
        firstName: r.first_name, middleName: r.middle_name, lastName: r.last_name,
        name: `${r.first_name} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name}`.trim(),
        program: r.program_name || r.program || 'Not assigned',
        programId: r.program_id, programDepartment: r.program_department,
        departmentId: r.department_id, departmentName: r.department_name || r.program_department || null, departmentCode: r.department_code,
        enrollmentYear: r.enrollment_year, classGroupId: r.class_group_id, classGroupName: r.class_group_name,
        dateOfBirth: r.date_of_birth, gender: r.gender, phone: r.phone, email: r.email, address: r.address,
        status: r.status, photoUrl: r.photo_url, createdAt: r.created_at,
      },
      academicEnrollments: enrollments.map((e) => ({
        id: e.academic_enrollment_id, programId: e.program_id, programName: e.program_name,
        academicYearId: e.academic_year_id, academicYearName: e.academic_year_name,
        classGroupId: e.class_group_id, classGroupName: e.group_name,
        levelNumber: e.level_number, enrollmentStatus: e.enrollment_status,
        startDate: e.start_date, endDate: e.end_date, notes: e.notes,
      })),
    });
  } catch (error) { next(error); }
});

router.put('/students/:studentNumber', async (req, res, next) => {
  try {
    const studentNumber = decodeURIComponent(req.params.studentNumber);
    const [rows] = await pool.execute('SELECT id, user_id FROM students WHERE student_number = ? LIMIT 1', [studentNumber]);
    if (!rows[0]) return res.status(404).json({ message: 'Student not found.' });
    const id = rows[0].id;

    const b = req.body ?? {};
    const fields = [];
    const params = [];
    const map = {
      first_name: b.first_name, middle_name: b.middle_name, last_name: b.last_name,
      program: b.program, program_id: b.program_id, enrollment_year: b.enrollment_year,
      class_group_id: b.class_group_id, date_of_birth: b.date_of_birth, gender: b.gender,
      phone: b.phone, email: b.email, address: b.address, status: b.status, photo_url: b.photo_url,
    };
    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        params.push(val === '' ? null : val);
      }
    }
    if (fields.length) {
      params.push(id);
      await pool.execute(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    // update program text if program_id provided but program not
    if (b.program_id && !b.program) {
      const [p] = await pool.execute('SELECT name FROM programs WHERE id = ? LIMIT 1', [b.program_id]);
      if (p[0]) await pool.execute('UPDATE students SET program = ? WHERE id = ?', [p[0].name, id]);
    }

    await writeAuditLog({
      actorUserId: req.user.sub, userId: rows[0].user_id, action: 'student_updated',
      entityType: 'student', entityId: id, details: { student_number: studentNumber, fields: Object.keys(map).filter((k) => map[k] !== undefined) }, request: req,
    });

    const [out] = await pool.query(`${studentSelectSql} WHERE s.id = ? LIMIT 1`, [id]);
    res.json({ student: out[0] });
  } catch (error) { next(error); }
});

router.patch('/students/:studentNumber/status', async (req, res, next) => {
  try {
    const studentNumber = decodeURIComponent(req.params.studentNumber);
    const status = req.body?.status;
    const allowed = ['active', 'graduated', 'suspended', 'withdrawn'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    const [rows] = await pool.execute('SELECT id, user_id FROM students WHERE student_number = ? LIMIT 1', [studentNumber]);
    if (!rows[0]) return res.status(404).json({ message: 'Student not found.' });
    await pool.execute('UPDATE students SET status = ? WHERE id = ?', [status, rows[0].id]);
    await writeAuditLog({
      actorUserId: req.user.sub, userId: rows[0].user_id, action: 'student_status_changed',
      entityType: 'student', entityId: rows[0].id, details: { student_number: studentNumber, status }, request: req,
    });
    res.json({ updated: true, student_number: studentNumber, status });
  } catch (error) { next(error); }
});

// duplicate detection helper
async function findDuplicates(firstName, lastName, dateOfBirth, phone, email, excludeId = null) {
  const conditions = ['LOWER(first_name) = LOWER(?)', 'LOWER(last_name) = LOWER(?)'];
  const params = [firstName, lastName];
  const extras = [];
  if (dateOfBirth) { extras.push('date_of_birth = ?'); params.push(dateOfBirth); }
  if (phone) { extras.push('phone = ?'); params.push(phone); }
  if (email) { extras.push('email = ?'); params.push(email); }
  if (extras.length) conditions.push(`(${extras.join(' OR ')})`);
  if (excludeId) { conditions.push('id <> ?'); params.push(excludeId); }
  const [rows] = await pool.query(`SELECT id, student_number, first_name, last_name, date_of_birth, phone, email FROM students WHERE ${conditions.join(' AND ')} LIMIT 5`, params);
  return rows;
}

router.post('/students/import', async (req, res, next) => {
  try {
    const csv = typeof req.body?.csv === 'string' ? req.body.csv : '';
    const sourceFile = typeof req.body?.source_file === 'string' ? req.body.source_file : 'upload.csv';
    if (!csv.trim()) return res.status(400).json({ message: 'CSV content is required.' });

    const lines = csv.trim().split(/\r?\n/);
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = (name) => header.indexOf(name);

    const [batchInsert] = await pool.execute(
      'INSERT INTO student_import_batches (imported_by, source_file, total_rows) VALUES (?, ?, ?)',
      [req.user.sub, sourceFile, lines.length - 1],
    );
    const batchId = batchInsert.insertId;

    let inserted = 0, errors = 0;
    const errorList = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const firstName = cols[idx('first_name')] ?? '';
      const lastName = cols[idx('last_name')] ?? '';
      const studentNumber = cols[idx('student_number')] ?? '';
      const program = cols[idx('program')] ?? '';
      const enrollmentYear = cols[idx('enrollment_year')] ?? '';
      const email = idx('email') >= 0 ? cols[idx('email')] : '';
      const phone = idx('phone') >= 0 ? cols[idx('phone')] : '';
      const dob = idx('date_of_birth') >= 0 ? cols[idx('date_of_birth')] : '';

      const rowErrors = [];
      if (!firstName) rowErrors.push('first_name is required');
      if (!lastName) rowErrors.push('last_name is required');
      if (!studentNumber) rowErrors.push('student_number is required');

      // duplicate check
      const dups = await findDuplicates(firstName, lastName, dob || null, phone || null, email || null);
      if (dups.length) rowErrors.push(`possible duplicate of ${dups.map((d) => d.student_number).join(', ')}`);

      if (rowErrors.length) {
        errors++;
        await pool.execute(
          'INSERT INTO student_import_errors (batch_id, row_number, error_message) VALUES (?, ?, ?)',
          [batchId, i, rowErrors.join('; ')],
        );
        errorList.push({ row: i, errors: rowErrors });
        continue;
      }

      try {
        const [userInsert] = await pool.execute(
          'INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
          [`${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, '') || studentNumber, await (await import('bcryptjs')).default.hash('Password123!', 10), 'student'],
        );
        await pool.execute(
          'INSERT INTO students (user_id, student_number, first_name, last_name, program, enrollment_year, email, phone, date_of_birth, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [userInsert.insertId, studentNumber, firstName, lastName, program || 'Not assigned', enrollmentYear ? Number(enrollmentYear) : null, email || null, phone || null, dob || null, 'active'],
        );
        inserted++;
      } catch (e) {
        errors++;
        await pool.execute(
          'INSERT INTO student_import_errors (batch_id, row_number, error_message) VALUES (?, ?, ?)',
          [batchId, i, e.message],
        );
        errorList.push({ row: i, errors: [e.message] });
      }
    }

    await pool.execute(
      'UPDATE student_import_batches SET total_rows = ? WHERE batch_id = ?',
      [lines.length - 1, batchId],
    );

    await writeAuditLog({
      actorUserId: req.user.sub, action: 'student_import', entityType: 'student_import_batch',
      entityId: batchId, details: { source_file: sourceFile, inserted, errors }, request: req,
    });

    res.status(201).json({ batchId, total: lines.length - 1, inserted, errors, errorList });
  } catch (error) { next(error); }
});

// update create student to include all fields + duplicate detection
router.post('/students', async (req, res, next) => {
  // override by redefining: remove previous handler? Express keeps both. To avoid duplicate, we instead handle here and skip old.
  // We'll delegate to a new implementation and not call next.
  try {
    const b = req.body ?? {};
    const firstName = (b.first_name ?? '').trim();
    const lastName = (b.last_name ?? '').trim();
    const studentNumber = (b.student_number ?? `ST-${Date.now()}`).trim();
    if (!firstName || !lastName || !studentNumber) {
      return res.status(400).json({ message: 'first_name, last_name and student_number are required.' });
    }

    const dups = await findDuplicates(firstName, lastName, b.date_of_birth || null, b.phone || null, b.email || null);
    if (dups.length) {
      return res.status(409).json({ message: 'Possible duplicate student.', duplicates: dups });
    }

    const username = (b.username ?? `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, '')).trim() || studentNumber;
    const password = b.password ?? 'Password123!';

    const bcrypt = await import('bcryptjs');
    const [userInsert] = await pool.execute(
      'INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
      [username, await bcrypt.default.hash(password, 10), 'student'],
    );

    const [result] = await pool.execute(
      `INSERT INTO students (user_id, student_number, first_name, middle_name, last_name, program, program_id, enrollment_year, class_group_id, date_of_birth, gender, phone, email, address, status, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userInsert.insertId, studentNumber, firstName, b.middle_name || null, lastName,
        b.program || 'Not assigned', b.program_id || null, b.enrollment_year ? Number(b.enrollment_year) : null,
        b.class_group_id || null, b.date_of_birth || null, b.gender || null, b.phone || null, b.email || null,
        b.address || null, b.status || 'active', b.photo_url || null,
      ],
    );

    if (b.program_id && !b.program) {
      const [p] = await pool.execute('SELECT name FROM programs WHERE id = ? LIMIT 1', [b.program_id]);
      if (p[0]) await pool.execute('UPDATE students SET program = ? WHERE id = ?', [p[0].name, result.insertId]);
    }

    await writeAuditLog({
      actorUserId: req.user.sub, userId: userInsert.insertId, action: 'student_created',
      entityType: 'student', entityId: result.insertId, details: { student_number: studentNumber, name: `${firstName} ${lastName}` }, request: req,
    });

    const [rows] = await pool.query(`${studentSelectSql} WHERE s.id = ? LIMIT 1`, [result.insertId]);
    res.status(201).json({ student: rows[0] });
  } catch (error) { next(error); }
});

// ---------- Staff: list, profile, update, status ----------
router.get('/staff', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const departmentId = req.query.department_id ? Number(req.query.department_id) : null;
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 100)));
    const offset = Math.max(0, Number(req.query.offset ?? 0));
    const conditions = []; const params = [];
    if (search) {
      conditions.push('(t.employee_number LIKE ? OR t.first_name LIKE ? OR t.last_name LIKE ? OR t.email LIKE ? OR t.phone LIKE ?)');
      const like = `%${search}%`; params.push(like, like, like, like, like);
    }
    if (status) { conditions.push('t.status = ?'); params.push(status); }
    if (departmentId) { conditions.push('t.department_id = ?'); params.push(departmentId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`${teacherSelectSql} ${where} ORDER BY t.id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM teachers t ${where}`, params);
    res.json({
      staff: rows.map((r) => ({
        id: r.id, userId: r.user_id, employeeNumber: r.employee_number,
        firstName: r.first_name, lastName: r.last_name, name: `${r.first_name} ${r.last_name}`.trim(),
        department: r.department_name || r.department || 'Not assigned', departmentId: r.department_id,
        departmentCode: r.department_code, phone: r.phone, email: r.email, hireDate: r.hire_date,
        status: r.status, photoUrl: r.photo_url, createdAt: r.created_at,
      })),
      total: Number(countRow.total), limit, offset,
    });
  } catch (error) { next(error); }
});

router.get('/staff/:employeeNumber', async (req, res, next) => {
  try {
    const employeeNumber = decodeURIComponent(req.params.employeeNumber);
    const [rows] = await pool.query(`${teacherSelectSql} WHERE t.employee_number = ? LIMIT 1`, [employeeNumber]);
    if (!rows[0]) return res.status(404).json({ message: 'Staff not found.' });
    const r = rows[0];
    const [qualifications] = await pool.query('SELECT qualification_id, qualification, field_of_study, institution, year_completed, document_url FROM teacher_qualifications WHERE teacher_id = ? ORDER BY qualification_id DESC', [r.id]);
    const [assignments] = await pool.query(`
      SELECT toa.assignment_id, toa.offering_id, toa.assignment_role, toa.assigned_from, toa.assigned_until, toa.is_active,
             c.code AS course_code, c.title AS course_title, o.section, s.name AS semester_name
      FROM teacher_offering_assignments toa
      JOIN course_offerings o ON o.id = toa.offering_id
      JOIN courses c ON c.id = o.course_id
      JOIN semesters s ON s.id = o.semester_id
      WHERE toa.teacher_id = ? ORDER BY toa.created_at DESC
    `, [r.id]);
    const [leave] = await pool.query('SELECT leave_id, leave_type, start_date, end_date, status, reason, submitted_at, reviewed_at FROM staff_leave_requests WHERE staff_id = ? ORDER BY submitted_at DESC', [r.id]);
    const [attendance] = await pool.query('SELECT attendance_id, attendance_date, status, check_in, check_out, remarks FROM staff_attendance WHERE teacher_id = ? ORDER BY attendance_date DESC LIMIT 30', [r.id]);
    res.json({
      staff: {
        id: r.id, userId: r.user_id, employeeNumber: r.employee_number,
        firstName: r.first_name, lastName: r.last_name, name: `${r.first_name} ${r.last_name}`.trim(),
        department: r.department_name || r.department || 'Not assigned', departmentId: r.department_id,
        phone: r.phone, email: r.email, hireDate: r.hire_date, status: r.status, photoUrl: r.photo_url,
      },
      qualifications: qualifications.map((q) => ({ id: q.qualification_id, qualification: q.qualification, fieldOfStudy: q.field_of_study, institution: q.institution, yearCompleted: q.year_completed, documentUrl: q.document_url })),
      assignments: assignments.map((a) => ({ id: a.assignment_id, offeringId: a.offering_id, role: a.assignment_role, from: a.assigned_from, until: a.assigned_until, isActive: Boolean(a.is_active), courseCode: a.course_code, courseTitle: a.course_title, section: a.section, semester: a.semester_name })),
      leaveRequests: leave.map((l) => ({ id: l.leave_id, leaveType: l.leave_type, startDate: l.start_date, endDate: l.end_date, status: l.status, reason: l.reason, submittedAt: l.submitted_at, reviewedAt: l.reviewed_at })),
      attendance: attendance.map((a) => ({ id: a.attendance_id, date: a.attendance_date, status: a.status, checkIn: a.check_in, checkOut: a.check_out, remarks: a.remarks })),
    });
  } catch (error) { next(error); }
});

router.put('/staff/:employeeNumber', async (req, res, next) => {
  try {
    const employeeNumber = decodeURIComponent(req.params.employeeNumber);
    const [rows] = await pool.execute('SELECT id, user_id FROM teachers WHERE employee_number = ? LIMIT 1', [employeeNumber]);
    if (!rows[0]) return res.status(404).json({ message: 'Staff not found.' });
    const id = rows[0].id;
    const b = req.body ?? {};
    const fields = []; const params = [];
    const map = {
      first_name: b.first_name, last_name: b.last_name, department: b.department, department_id: b.department_id,
      phone: b.phone, email: b.email, hire_date: b.hire_date, status: b.status, photo_url: b.photo_url,
    };
    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined) { fields.push(`${col} = ?`); params.push(val === '' ? null : val); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE teachers SET ${fields.join(', ')} WHERE id = ?`, params); }
    await writeAuditLog({ actorUserId: req.user.sub, userId: rows[0].user_id, action: 'teacher_updated', entityType: 'teacher', entityId: id, details: { employee_number: employeeNumber }, request: req });
    const [out] = await pool.query(`${teacherSelectSql} WHERE t.id = ? LIMIT 1`, [id]);
    res.json({ staff: out[0] });
  } catch (error) { next(error); }
});

router.patch('/staff/:employeeNumber/status', async (req, res, next) => {
  try {
    const employeeNumber = decodeURIComponent(req.params.employeeNumber);
    const status = req.body?.status;
    if (!['active','inactive','on_leave'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    const [rows] = await pool.execute('SELECT id, user_id FROM teachers WHERE employee_number = ? LIMIT 1', [employeeNumber]);
    if (!rows[0]) return res.status(404).json({ message: 'Staff not found.' });
    await pool.execute('UPDATE teachers SET status = ? WHERE id = ?', [status, rows[0].id]);
    await writeAuditLog({ actorUserId: req.user.sub, userId: rows[0].user_id, action: 'teacher_status_changed', entityType: 'teacher', entityId: rows[0].id, details: { employee_number: employeeNumber, status }, request: req });
    res.json({ updated: true, employee_number: employeeNumber, status });
  } catch (error) { next(error); }
});

// ---------- Staff leave ----------
router.get('/staff/leave-types', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT leave_type_id, type_name, is_paid, default_days FROM staff_leave_types ORDER BY type_name');
    res.json({ leaveTypes: rows });
  } catch (error) { next(error); }
});

router.get('/staff/:employeeNumber/leave', async (req, res, next) => {
  try {
    const employeeNumber = decodeURIComponent(req.params.employeeNumber);
    const [t] = await pool.execute('SELECT id FROM teachers WHERE employee_number = ? LIMIT 1', [employeeNumber]);
    if (!t[0]) return res.status(404).json({ message: 'Staff not found.' });
    const [rows] = await pool.query('SELECT leave_id, leave_type, start_date, end_date, status, reason, submitted_at, reviewed_at, reviewed_by FROM staff_leave_requests WHERE staff_id = ? ORDER BY submitted_at DESC', [t[0].id]);
    res.json({ leaveRequests: rows });
  } catch (error) { next(error); }
});

router.post('/staff/:employeeNumber/leave', async (req, res, next) => {
  try {
    const employeeNumber = decodeURIComponent(req.params.employeeNumber);
    const [t] = await pool.execute('SELECT id FROM teachers WHERE employee_number = ? LIMIT 1', [employeeNumber]);
    if (!t[0]) return res.status(404).json({ message: 'Staff not found.' });
    const b = req.body ?? {};
    if (!b.leave_type || !b.start_date || !b.end_date) return res.status(400).json({ message: 'leave_type, start_date, end_date are required.' });
    const [r] = await pool.execute('INSERT INTO staff_leave_requests (staff_id, leave_type, start_date, end_date, status, reason) VALUES (?, ?, ?, ?, ?, ?)', [t[0].id, b.leave_type, b.start_date, b.end_date, b.status || 'pending', b.reason || null]);
    await writeAuditLog({ actorUserId: req.user.sub, action: 'leave_requested', entityType: 'staff_leave_request', entityId: r.insertId, details: { employee_number: employeeNumber, leave_type: b.leave_type }, request: req });
    res.status(201).json({ leaveId: r.insertId });
  } catch (error) { next(error); }
});

router.patch('/staff/leave/:leaveId', async (req, res, next) => {
  try {
    const leaveId = Number(req.params.leaveId);
    const status = req.body?.status;
    if (!['pending','approved','rejected','cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    await pool.execute('UPDATE staff_leave_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE leave_id = ?', [status, req.user.sub, leaveId]);
    await writeAuditLog({ actorUserId: req.user.sub, action: 'leave_reviewed', entityType: 'staff_leave_request', entityId: leaveId, details: { status }, request: req });
    res.json({ updated: true, leave_id: leaveId, status });
  } catch (error) { next(error); }
});

// ---------- Staff attendance ----------
router.get('/staff/:employeeNumber/attendance', async (req, res, next) => {
  try {
    const employeeNumber = decodeURIComponent(req.params.employeeNumber);
    const [t] = await pool.execute('SELECT id FROM teachers WHERE employee_number = ? LIMIT 1', [employeeNumber]);
    if (!t[0]) return res.status(404).json({ message: 'Staff not found.' });
    const [rows] = await pool.query('SELECT attendance_id, attendance_date, status, check_in, check_out, remarks FROM staff_attendance WHERE teacher_id = ? ORDER BY attendance_date DESC LIMIT 60', [t[0].id]);
    res.json({ attendance: rows });
  } catch (error) { next(error); }
});

router.post('/staff/:employeeNumber/attendance', async (req, res, next) => {
  try {
    const employeeNumber = decodeURIComponent(req.params.employeeNumber);
    const [t] = await pool.execute('SELECT id FROM teachers WHERE employee_number = ? LIMIT 1', [employeeNumber]);
    if (!t[0]) return res.status(404).json({ message: 'Staff not found.' });
    const b = req.body ?? {};
    if (!b.attendance_date) return res.status(400).json({ message: 'attendance_date is required.' });
    const [r] = await pool.execute('INSERT INTO staff_attendance (teacher_id, attendance_date, status, check_in, check_out, remarks, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [t[0].id, b.attendance_date, b.status || 'present', b.check_in || null, b.check_out || null, b.remarks || null, req.user.sub]);
    await writeAuditLog({ actorUserId: req.user.sub, action: 'staff_attendance_recorded', entityType: 'staff_attendance', entityId: r.insertId, details: { employee_number: employeeNumber, date: b.attendance_date, status: b.status || 'present' }, request: req });
    res.status(201).json({ attendanceId: r.insertId });
  } catch (error) { next(error); }
});

// ---------- Departments ----------
router.get('/departments', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT department_id, name, code, head_staff_id, created_at FROM departments ORDER BY name');
    res.json({ departments: rows });
  } catch (error) { next(error); }
});
router.post('/departments', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const name = asText(b.name, 'Name');
    const code = asText(b.code ?? name.slice(0,4).toUpperCase(), 'Code');
    const [r] = await pool.execute('INSERT INTO departments (name, code, head_staff_id) VALUES (?, ?, ?)', [name, code, b.head_staff_id || null]);
    res.status(201).json({ departmentId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/departments/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const b = req.body ?? {};
    const fields = []; const params = [];
    if (b.name !== undefined) { fields.push('name = ?'); params.push(b.name); }
    if (b.code !== undefined) { fields.push('code = ?'); params.push(b.code); }
    if (b.head_staff_id !== undefined) { fields.push('head_staff_id = ?'); params.push(b.head_staff_id || null); }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE departments SET ${fields.join(', ')} WHERE department_id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/departments/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM departments WHERE department_id = ?', [Number(req.params.id)]);
    res.json({ deleted: true });
  } catch (error) { next(error); }
});

// ---------- Courses ----------
router.get('/courses', async (req, res, next) => {
  try {
    const programId = req.query.program_id ? Number(req.query.program_id) : null;
    const conditions = []; const params = [];
    if (programId) { conditions.push('program_id = ?'); params.push(programId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT id, code, title, description, credit_hours, program_id, level_number, is_active FROM courses ${where} ORDER BY title`, params);
    res.json({ courses: rows });
  } catch (error) { next(error); }
});
router.post('/courses', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const code = asText(b.code, 'Code');
    const title = asText(b.title, 'Title');
    const [r] = await pool.execute('INSERT INTO courses (code, title, description, credit_hours, program_id, level_number, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)', [code, title, b.description || null, b.credit_hours || 3, b.program_id || null, b.level_number || 1, b.is_active ?? 1]);
    res.status(201).json({ courseId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/courses/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col, key] of [['code','code'],['title','title'],['description','description'],['credit_hours','credit_hours'],['program_id','program_id'],['level_number','level_number'],['is_active','is_active']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : b[key]); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/courses/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM courses WHERE id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Course offerings ----------
router.get('/offerings', async (req, res, next) => {
  try {
    const semesterId = req.query.semester_id ? Number(req.query.semester_id) : null;
    const conditions = []; const params = [];
    if (semesterId) { conditions.push('o.semester_id = ?'); params.push(semesterId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`
      SELECT o.id, o.course_id, o.teacher_id, o.semester_id, o.section, o.room, o.room_id, o.capacity, o.status, o.lab_required,
             c.code AS course_code, c.title AS course_title, t.first_name AS teacher_first, t.last_name AS teacher_last,
             s.name AS semester_name, r.room_name, r.room_code
      FROM course_offerings o
      JOIN courses c ON c.id = o.course_id
      LEFT JOIN teachers t ON t.id = o.teacher_id
      JOIN semesters s ON s.id = o.semester_id
      LEFT JOIN rooms r ON r.room_id = o.room_id
      ${where} ORDER BY o.id DESC
    `, params);
    res.json({ offerings: rows });
  } catch (error) { next(error); }
});
router.post('/offerings', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO course_offerings (course_id, teacher_id, semester_id, section, room, room_id, capacity, status, lab_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [b.course_id, b.teacher_id, b.semester_id, b.section || 'A', b.room || null, b.room_id || null, b.capacity || 40, b.status || 'open', b.lab_required ? 1 : 0]);
    res.status(201).json({ offeringId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/offerings/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col,key] of [['course_id','course_id'],['teacher_id','teacher_id'],['semester_id','semester_id'],['section','section'],['room','room'],['room_id','room_id'],['capacity','capacity'],['status','status'],['lab_required','lab_required']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : (key==='lab_required' ? (b[key]?1:0) : b[key])); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE course_offerings SET ${fields.join(', ')} WHERE id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/offerings/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM course_offerings WHERE id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Class groups ----------
router.get('/class-groups', async (req, res, next) => {
  try {
    const programId = req.query.program_id ? Number(req.query.program_id) : null;
    const conditions = []; const params = [];
    if (programId) { conditions.push('program_id = ?'); params.push(programId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT class_group_id, program_id, academic_year_id, level_number, section_code, group_name, capacity, status FROM class_groups ${where} ORDER BY class_group_id DESC`, params);
    res.json({ classGroups: rows });
  } catch (error) { next(error); }
});
router.post('/class-groups', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO class_groups (program_id, academic_year_id, level_number, section_code, group_name, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [b.program_id, b.academic_year_id, b.level_number || 1, b.section_code || 'A', b.group_name, b.capacity || null, b.status || 'planned']);
    res.status(201).json({ classGroupId: r.insertId });
  } catch (error) { next(error); }
});

// ---------- Rooms ----------
router.get('/rooms', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT room_id, room_code, room_name, room_type, building, floor_label, capacity, status, notes FROM rooms ORDER BY room_name');
    res.json({ rooms: rows });
  } catch (error) { next(error); }
});
router.post('/rooms', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO rooms (room_code, room_name, room_type, building, floor_label, capacity, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [b.room_code, b.room_name, b.room_type || 'classroom', b.building || null, b.floor_label || null, b.capacity || null, b.status || 'available', b.notes || null]);
    res.status(201).json({ roomId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/rooms/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col,key] of [['room_code','room_code'],['room_name','room_name'],['room_type','room_type'],['building','building'],['floor_label','floor_label'],['capacity','capacity'],['status','status'],['notes','notes']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : b[key]); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE rooms SET ${fields.join(', ')} WHERE room_id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/rooms/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM rooms WHERE room_id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Timetable entries ----------
router.get('/timetable', async (req, res, next) => {
  try {
    const offeringId = req.query.offering_id ? Number(req.query.offering_id) : null;
    const conditions = []; const params = [];
    if (offeringId) { conditions.push('te.offering_id = ?'); params.push(offeringId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`
      SELECT te.id, te.offering_id, te.weekday, te.starts_at, te.ends_at, te.room, te.room_id, te.effective_from, te.effective_until, te.schedule_status,
             r.room_name, r.room_code
      FROM timetable_entries te
      LEFT JOIN rooms r ON r.room_id = te.room_id
      ${where} ORDER BY te.weekday, te.starts_at
    `, params);
    res.json({ entries: rows });
  } catch (error) { next(error); }
});
router.post('/timetable', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO timetable_entries (offering_id, weekday, starts_at, ends_at, room, room_id, effective_from, effective_until, schedule_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [b.offering_id, b.weekday, b.starts_at, b.ends_at, b.room || null, b.room_id || null, b.effective_from || null, b.effective_until || null, b.schedule_status || 'active']);
    res.status(201).json({ entryId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/timetable/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col,key] of [['offering_id','offering_id'],['weekday','weekday'],['starts_at','starts_at'],['ends_at','ends_at'],['room','room'],['room_id','room_id'],['effective_from','effective_from'],['effective_until','effective_until'],['schedule_status','schedule_status']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : b[key]); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE timetable_entries SET ${fields.join(', ')} WHERE id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/timetable/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM timetable_entries WHERE id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Academic calendar events ----------
router.get('/calendar-events', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT event_id, title, event_type, starts_at, ends_at, location, created_by, created_at FROM academic_calendar_events ORDER BY starts_at DESC');
    res.json({ events: rows });
  } catch (error) { next(error); }
});
router.post('/calendar-events', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO academic_calendar_events (title, event_type, starts_at, ends_at, location, created_by) VALUES (?, ?, ?, ?, ?, ?)', [b.title, b.event_type, b.starts_at, b.ends_at, b.location || null, req.user.sub]);
    res.status(201).json({ eventId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/calendar-events/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col,key] of [['title','title'],['event_type','event_type'],['starts_at','starts_at'],['ends_at','ends_at'],['location','location']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : b[key]); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE academic_calendar_events SET ${fields.join(', ')} WHERE event_id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/calendar-events/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM academic_calendar_events WHERE event_id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Academic years / semesters / term config ----------
router.get('/academic-years', async (_req, res, next) => {
  try { const [rows] = await pool.query('SELECT id, name, starts_on, ends_on, is_current FROM academic_years ORDER BY id DESC'); res.json({ academicYears: rows }); }
  catch (error) { next(error); }
});
router.get('/semesters', async (req, res, next) => {
  try {
    const ay = req.query.academic_year_id ? Number(req.query.academic_year_id) : null;
    const conditions = []; const params = [];
    if (ay) { conditions.push('academic_year_id = ?'); params.push(ay); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT id, academic_year_id, name, starts_on, ends_on, is_current FROM semesters ${where} ORDER BY id DESC`, params);
    res.json({ semesters: rows });
  } catch (error) { next(error); }
});
router.get('/term-configurations', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT term_config_id, academic_year_id, semester_id, is_active_term FROM term_configurations');
    res.json({ termConfigurations: rows });
  } catch (error) { next(error); }
});

// ---------- Manual enrollment ----------
router.get('/enrollments', async (req, res, next) => {
  try {
    const offeringId = req.query.offering_id ? Number(req.query.offering_id) : null;
    const studentId = req.query.student_id ? Number(req.query.student_id) : null;
    const conditions = []; const params = [];
    if (offeringId) { conditions.push('e.offering_id = ?'); params.push(offeringId); }
    if (studentId) { conditions.push('e.student_id = ?'); params.push(studentId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`
      SELECT e.id, e.student_id, e.offering_id, e.enrolled_at, e.status,
             s.student_number, s.first_name, s.last_name, c.code AS course_code, c.title AS course_title, o.section
      FROM enrollments e
      JOIN students s ON s.id = e.student_id
      JOIN course_offerings o ON o.id = e.offering_id
      JOIN courses c ON c.id = o.course_id
      ${where} ORDER BY e.enrolled_at DESC
    `, params);
    res.json({ enrollments: rows });
  } catch (error) { next(error); }
});
router.post('/enrollments', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const studentId = b.student_id; const offeringId = b.offering_id;
    if (!studentId || !offeringId) return res.status(400).json({ message: 'student_id and offering_id are required.' });
    const [r] = await pool.execute('INSERT INTO enrollments (student_id, offering_id, status) VALUES (?, ?, ?)', [studentId, offeringId, b.status || 'enrolled']);
    // also update student_academic_enrollments? optional; skip
    await writeAuditLog({ actorUserId: req.user.sub, action: 'student_enrolled', entityType: 'enrollment', entityId: r.insertId, details: { student_id: studentId, offering_id: offeringId }, request: req });
    res.status(201).json({ enrollmentId: r.insertId });
  } catch (error) { next(error); }
});
router.delete('/enrollments/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM enrollments WHERE id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Attendance ----------
router.get('/attendance/sessions', async (req, res, next) => {
  try {
    const offeringId = req.query.offering_id ? Number(req.query.offering_id) : null;
    const date = typeof req.query.date === 'string' ? req.query.date : null;
    const conditions = []; const params = [];
    if (offeringId) { conditions.push('s.offering_id = ?'); params.push(offeringId); }
    if (date) { conditions.push('s.session_date = ?'); params.push(date); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`
      SELECT s.id, s.offering_id, s.session_date, s.topic, s.recorded_by, s.created_at,
             c.code AS course_code, c.title AS course_title, o.section
      FROM attendance_sessions s
      JOIN course_offerings o ON o.id = s.offering_id
      JOIN courses c ON c.id = o.course_id
      ${where} ORDER BY s.session_date DESC, s.id DESC
    `, params);
    res.json({ sessions: rows });
  } catch (error) { next(error); }
});

router.post('/attendance/sessions', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.offering_id || !b.session_date) return res.status(400).json({ message: 'offering_id and session_date are required.' });
    const [r] = await pool.execute('INSERT INTO attendance_sessions (offering_id, session_date, topic, recorded_by) VALUES (?, ?, ?, ?)', [b.offering_id, b.session_date, b.topic || null, req.user.sub]);
    res.status(201).json({ sessionId: r.insertId });
  } catch (error) { next(error); }
});

router.get('/attendance/sessions/:id/records', async (req, res, next) => {
  try {
    const sessionId = Number(req.params.id);
    const [session] = await pool.query('SELECT s.id, s.offering_id, s.session_date, s.topic FROM attendance_sessions s WHERE s.id = ? LIMIT 1', [sessionId]);
    if (!session[0]) return res.status(404).json({ message: 'Session not found.' });
    const [records] = await pool.query(`
      SELECT ar.id, ar.student_id, ar.status, ar.note, ar.marked_at,
             st.student_number, st.first_name, st.last_name
      FROM attendance_records ar
      JOIN students st ON st.id = ar.student_id
      WHERE ar.session_id = ?
      ORDER BY st.last_name, st.first_name
    `, [sessionId]);
    // also roster for the offering
    const [roster] = await pool.query(`
      SELECT s.id AS student_id, s.student_number, s.first_name, s.last_name
      FROM enrollments e JOIN students s ON s.id = e.student_id
      WHERE e.offering_id = ? AND e.status = 'enrolled'
      ORDER BY s.last_name, s.first_name
    `, [session[0].offering_id]);
    res.json({ session: session[0], records, roster });
  } catch (error) { next(error); }
});

router.put('/attendance/sessions/:id/records', async (req, res, next) => {
  try {
    const sessionId = Number(req.params.id);
    const records = Array.isArray(req.body?.records) ? req.body.records : [];
    for (const rec of records) {
      // upsert
      const [existing] = await pool.execute('SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ? LIMIT 1', [sessionId, rec.student_id]);
      if (existing[0]) {
        await pool.execute('UPDATE attendance_records SET status = ?, note = ? WHERE id = ?', [rec.status || 'present', rec.note || null, existing[0].id]);
      } else {
        await pool.execute('INSERT INTO attendance_records (session_id, student_id, status, note) VALUES (?, ?, ?, ?)', [sessionId, rec.student_id, rec.status || 'present', rec.note || null]);
      }
    }
    await writeAuditLog({ actorUserId: req.user.sub, action: 'attendance_recorded', entityType: 'attendance_session', entityId: sessionId, details: { count: records.length }, request: req });
    res.json({ updated: true, count: records.length });
  } catch (error) { next(error); }
});

router.get('/attendance/report', async (req, res, next) => {
  try {
    const studentId = req.query.student_id ? Number(req.query.student_id) : null;
    const offeringId = req.query.offering_id ? Number(req.query.offering_id) : null;
    const departmentId = req.query.department_id ? Number(req.query.department_id) : null;
    const conditions = []; const params = [];
    if (studentId) { conditions.push('ar.student_id = ?'); params.push(studentId); }
    if (offeringId) { conditions.push('s.offering_id = ?'); params.push(offeringId); }
    if (departmentId) { conditions.push('p.department_id = ?'); params.push(departmentId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`
      SELECT ar.student_id, st.student_number, st.first_name, st.last_name,
             s.offering_id, c.code AS course_code, c.title AS course_title,
             COUNT(ar.id) AS total,
             SUM(CASE WHEN ar.status='present' THEN 1 WHEN ar.status='late' THEN 0.5 ELSE 0 END) AS present_weighted,
             SUM(CASE WHEN ar.status='absent' THEN 1 ELSE 0 END) AS absent
      FROM attendance_records ar
      JOIN attendance_sessions s ON s.id = ar.session_id
      JOIN students st ON st.id = ar.student_id
      JOIN course_offerings o ON o.id = s.offering_id
      JOIN courses c ON c.id = o.course_id
      LEFT JOIN programs p ON p.id = st.program_id
      ${where}
      GROUP BY ar.student_id, s.offering_id
      ORDER BY st.last_name, st.first_name
    `, params);
    const report = rows.map((r) => {
      const total = Number(r.total || 0);
      const pw = Number(r.present_weighted || 0);
      const rate = total > 0 ? Math.round((pw / total) * 100) : 0;
      return {
        studentId: r.student_id, studentNumber: r.student_number, name: `${r.first_name} ${r.last_name}`,
        offeringId: r.offering_id, courseCode: r.course_code, courseTitle: r.course_title,
        totalSessions: total, presentWeighted: pw, absent: Number(r.absent || 0), attendanceRate: rate,
      };
    });
    res.json({ report });
  } catch (error) { next(error); }
});

router.get('/attendance/low-flags', async (req, res, next) => {
  try {
    const threshold = Number(req.query.threshold ?? 75);
    const [settings] = await pool.query("SELECT setting_value FROM academic_settings WHERE setting_key = 'low_attendance_threshold_percent' LIMIT 1");
    const thr = settings[0] ? Number(settings[0].setting_value) : threshold;
    const { report } = await (async () => {
      const [rows] = await pool.query(`
        SELECT ar.student_id, st.student_number, st.first_name, st.last_name,
               s.offering_id, c.code AS course_code, c.title AS course_title,
               COUNT(ar.id) AS total,
               SUM(CASE WHEN ar.status='present' THEN 1 WHEN ar.status='late' THEN 0.5 ELSE 0 END) AS present_weighted
        FROM attendance_records ar
        JOIN attendance_sessions s ON s.id = ar.session_id
        JOIN students st ON st.id = ar.student_id
        JOIN course_offerings o ON o.id = s.offering_id
        JOIN courses c ON c.id = o.course_id
        GROUP BY ar.student_id, s.offering_id
      `);
      const rep = rows.map((r) => {
        const total = Number(r.total || 0);
        const pw = Number(r.present_weighted || 0);
        const rate = total > 0 ? Math.round((pw / total) * 100) : 0;
        return { studentId: r.student_id, studentNumber: r.student_number, name: `${r.first_name} ${r.last_name}`, offeringId: r.offering_id, courseCode: r.course_code, courseTitle: r.course_title, attendanceRate: rate };
      }).filter((x) => x.attendanceRate < thr);
      return { report: rep };
    })();
    res.json({ threshold: thr, flags: report });
  } catch (error) { next(error); }
});

// ---------- Assessments ----------
router.get('/assessments', async (req, res, next) => {
  try {
    const offeringId = req.query.offering_id ? Number(req.query.offering_id) : null;
    const conditions = []; const params = [];
    if (offeringId) { conditions.push('offering_id = ?'); params.push(offeringId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT id, offering_id, title, assessment_type, max_score, weight_percent, due_date, published FROM assessments ${where} ORDER BY id DESC`, params);
    res.json({ assessments: rows });
  } catch (error) { next(error); }
});
router.post('/assessments', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO assessments (offering_id, title, assessment_type, max_score, weight_percent, due_date, published) VALUES (?, ?, ?, ?, ?, ?, ?)', [b.offering_id, b.title, b.assessment_type || 'test', b.max_score || 100, b.weight_percent || 0, b.due_date || null, b.published ? 1 : 0]);
    res.status(201).json({ assessmentId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/assessments/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col,key] of [['offering_id','offering_id'],['title','title'],['assessment_type','assessment_type'],['max_score','max_score'],['weight_percent','weight_percent'],['due_date','due_date'],['published','published']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : (key==='published' ? (b[key]?1:0) : b[key])); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE assessments SET ${fields.join(', ')} WHERE id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/assessments/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM assessments WHERE id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Exam schedules ----------
router.get('/exam-schedules', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT es.schedule_id, es.assessment_id, es.exam_date, es.starts_at, es.ends_at, es.room_id, es.invigilator_teacher_id, es.status, es.created_at,
             a.title AS assessment_title, a.assessment_type, c.code AS course_code, c.title AS course_title, r.room_name
      FROM exam_schedules es
      JOIN assessments a ON a.id = es.assessment_id
      JOIN course_offerings o ON o.id = a.offering_id
      JOIN courses c ON c.id = o.course_id
      LEFT JOIN rooms r ON r.room_id = es.room_id
      ORDER BY es.exam_date DESC
    `);
    res.json({ examSchedules: rows });
  } catch (error) { next(error); }
});
router.post('/exam-schedules', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO exam_schedules (assessment_id, exam_date, starts_at, ends_at, room_id, invigilator_teacher_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [b.assessment_id, b.exam_date, b.starts_at, b.ends_at, b.room_id || null, b.invigilator_teacher_id || null, b.status || 'scheduled']);
    res.status(201).json({ scheduleId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/exam-schedules/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col,key] of [['assessment_id','assessment_id'],['exam_date','exam_date'],['starts_at','starts_at'],['ends_at','ends_at'],['room_id','room_id'],['invigilator_teacher_id','invigilator_teacher_id'],['status','status']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : b[key]); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE exam_schedules SET ${fields.join(', ')} WHERE schedule_id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/exam-schedules/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM exam_schedules WHERE schedule_id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Grades (list for entry) ----------
router.get('/grades', async (req, res, next) => {
  try {
    const offeringId = req.query.offering_id ? Number(req.query.offering_id) : null;
    const assessmentId = req.query.assessment_id ? Number(req.query.assessment_id) : null;
    const conditions = []; const params = [];
    if (offeringId) { conditions.push('a.offering_id = ?'); params.push(offeringId); }
    if (assessmentId) { conditions.push('g.assessment_id = ?'); params.push(assessmentId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`
      SELECT g.id AS grade_id, g.assessment_id, g.student_id, g.score, g.feedback, g.published, g.workflow_status,
             g.locked_at, g.graded_at, g.graded_by,
             a.title AS assessment_title, a.max_score, a.weight_percent, a.offering_id,
             s.student_number, s.first_name, s.last_name
      FROM grades g
      JOIN assessments a ON a.id = g.assessment_id
      JOIN students s ON s.id = g.student_id
      ${where}
      ORDER BY a.id, s.last_name, s.first_name
    `, params);
    res.json({ grades: rows });
  } catch (error) { next(error); }
});

// ---------- Grading scales ----------
router.get('/grading-scales', async (_req, res, next) => {
  try {
    const [scales] = await pool.query('SELECT scale_id, scale_name, max_gpa, is_default, is_active, created_at FROM grading_scales ORDER BY scale_id');
    const [rules] = await pool.query('SELECT rule_id, scale_id, minimum_score, maximum_score, letter_grade, grade_point, is_pass FROM grading_scale_rules ORDER BY scale_id, minimum_score');
    const grouped = scales.map((sc) => ({ ...sc, rules: rules.filter((r) => r.scale_id === sc.scale_id) }));
    res.json({ gradingScales: grouped });
  } catch (error) { next(error); }
});
router.post('/grading-scales', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO grading_scales (scale_name, max_gpa, is_default, is_active) VALUES (?, ?, ?, ?)', [b.scale_name, b.max_gpa || 4.00, b.is_default ? 1 : 0, b.is_active ?? 1]);
    res.status(201).json({ scaleId: r.insertId });
  } catch (error) { next(error); }
});
router.post('/grading-scale-rules', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO grading_scale_rules (scale_id, minimum_score, maximum_score, letter_grade, grade_point, is_pass) VALUES (?, ?, ?, ?, ?, ?)', [b.scale_id, b.minimum_score, b.maximum_score, b.letter_grade, b.grade_point, b.is_pass ?? 1]);
    res.status(201).json({ ruleId: r.insertId });
  } catch (error) { next(error); }
});
router.delete('/grading-scale-rules/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM grading_scale_rules WHERE rule_id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Result approval / publish control ----------
router.get('/result-approval-batches', async (req, res, next) => {
  try {
    const offeringId = req.query.offering_id ? Number(req.query.offering_id) : null;
    const conditions = []; const params = [];
    if (offeringId) { conditions.push('offering_id = ?'); params.push(offeringId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT approval_batch_id, offering_id, submitted_by, submitted_at, reviewed_by, reviewed_at, status, reviewer_notes, published_at FROM result_approval_batches ${where} ORDER BY submitted_at DESC`, params);
    res.json({ batches: rows });
  } catch (error) { next(error); }
});
router.post('/result-approval-batches', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO result_approval_batches (offering_id, submitted_by, status) VALUES (?, ?, ?)', [b.offering_id, req.user.sub, b.status || 'submitted']);
    // link grades
    if (Array.isArray(b.grade_ids)) {
      for (const gid of b.grade_ids) {
        await pool.execute('INSERT INTO result_approval_items (approval_batch_id, grade_id) VALUES (?, ?)', [r.insertId, gid]);
      }
    }
    res.status(201).json({ batchId: r.insertId });
  } catch (error) { next(error); }
});
router.patch('/result-approval-batches/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    if (b.status !== undefined) { fields.push('status = ?'); params.push(b.status); }
    if (b.reviewer_notes !== undefined) { fields.push('reviewer_notes = ?'); params.push(b.reviewer_notes); }
    if (b.status === 'published') { fields.push('published_at = NOW()'); }
    if (b.reviewed_by !== undefined) { fields.push('reviewed_by = ?'); params.push(b.reviewed_by); }
    fields.push('reviewed_at = NOW()');
    params.push(id);
    await pool.execute(`UPDATE result_approval_batches SET ${fields.join(', ')} WHERE approval_batch_id = ?`, params);
    // if published, mark grades published
    if (b.status === 'published') {
      const [items] = await pool.query('SELECT grade_id FROM result_approval_items WHERE approval_batch_id = ?', [id]);
      for (const it of items) {
        await pool.execute('UPDATE grades SET published = 1, workflow_status = ? WHERE id = ?', ['published', it.grade_id]);
      }
    }
    await writeAuditLog({ actorUserId: req.user.sub, action: 'result_approval_updated', entityType: 'result_approval_batch', entityId: id, details: { status: b.status }, request: req });
    res.json({ updated: true });
  } catch (error) { next(error); }
});

// ---------- Announcements (admin) ----------
router.get('/announcements', async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : null;
    const audience = typeof req.query.audience === 'string' ? req.query.audience : null;
    const conditions = []; const params = [];
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (audience) { conditions.push('audience = ?'); params.push(audience); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT id, title, body, audience, status, published_at, expires_at, created_by, created_at, department_id, class_group_id FROM announcements ${where} ORDER BY created_at DESC`, params);
    res.json({ announcements: rows });
  } catch (error) { next(error); }
});
router.post('/announcements', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const title = asText(b.title, 'Title');
    const body = asText(b.body, 'Body');
    const [r] = await pool.execute('INSERT INTO announcements (title, body, audience, status, published_at, expires_at, created_by, department_id, class_group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [title, body, b.audience || 'everyone', b.status || 'draft', b.published_at || (b.status === 'published' ? new Date() : null), b.expires_at || null, req.user.sub, b.department_id || null, b.class_group_id || null]);
    res.status(201).json({ announcementId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/announcements/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col,key] of [['title','title'],['body','body'],['audience','audience'],['status','status'],['published_at','published_at'],['expires_at','expires_at'],['department_id','department_id'],['class_group_id','class_group_id']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : b[key]); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE announcements SET ${fields.join(', ')} WHERE id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/announcements/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM announcements WHERE id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

// ---------- Documents ----------
router.get('/document-templates', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT template_id, template_name, template_type, body_html, updated_by, updated_at FROM document_templates ORDER BY template_name');
    res.json({ templates: rows });
  } catch (error) { next(error); }
});
router.post('/document-templates', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO document_templates (template_name, template_type, body_html, updated_by) VALUES (?, ?, ?, ?)', [b.template_name, b.template_type, b.body_html || null, req.user.sub]);
    res.status(201).json({ templateId: r.insertId });
  } catch (error) { next(error); }
});
router.put('/document-templates/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col,key] of [['template_name','template_name'],['template_type','template_type'],['body_html','body_html']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : b[key]); }
    }
    fields.push('updated_by = ?', 'updated_at = NOW()');
    params.push(req.user.sub, id);
    if (fields.length) await pool.execute(`UPDATE document_templates SET ${fields.join(', ')} WHERE template_id = ?`, params);
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/document-templates/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM document_templates WHERE template_id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

router.get('/student-documents', async (req, res, next) => {
  try {
    const studentId = req.query.student_id ? Number(req.query.student_id) : null;
    const conditions = []; const params = [];
    if (studentId) { conditions.push('sd.student_id = ?'); params.push(studentId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`
      SELECT sd.document_id, sd.student_id, sd.document_type, sd.file_name, sd.file_url, sd.generated_by, sd.generated_at,
             s.student_number, s.first_name, s.last_name
      FROM student_documents sd
      JOIN students s ON s.id = sd.student_id
      ${where} ORDER BY sd.generated_at DESC
    `, params);
    res.json({ documents: rows });
  } catch (error) { next(error); }
});
router.post('/student-documents', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO student_documents (student_id, document_type, file_name, file_url, generated_by) VALUES (?, ?, ?, ?, ?)', [b.student_id, b.document_type, b.file_name, b.file_url || null, req.user.sub]);
    res.status(201).json({ documentId: r.insertId });
  } catch (error) { next(error); }
});

// ---------- Reports / exports ----------
router.get('/reports/enrollment', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.name AS program, COUNT(s.id) AS students
      FROM programs p
      LEFT JOIN students s ON s.program_id = p.id
      GROUP BY p.id, p.name
      ORDER BY students DESC
    `);
    res.json({ enrollment: rows });
  } catch (error) { next(error); }
});
router.get('/reports/attendance', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.code AS course_code, c.title AS course_title,
             COUNT(ar.id) AS total,
             SUM(CASE WHEN ar.status='present' THEN 1 WHEN ar.status='late' THEN 0.5 ELSE 0 END) AS present_weighted
      FROM attendance_records ar
      JOIN attendance_sessions s ON s.id = ar.session_id
      JOIN course_offerings o ON o.id = s.offering_id
      JOIN courses c ON c.id = o.course_id
      GROUP BY c.id, c.code, c.title
      ORDER BY c.title
    `);
    const report = rows.map((r) => {
      const total = Number(r.total || 0);
      const pw = Number(r.present_weighted || 0);
      return { courseCode: r.course_code, courseTitle: r.course_title, totalSessions: total, presentWeighted: pw, attendanceRate: total > 0 ? Math.round((pw / total) * 100) : 0 };
    });
    res.json({ attendance: report });
  } catch (error) { next(error); }
});
router.get('/reports/results', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.code AS course_code, c.title AS course_title,
             COUNT(g.id) AS grades,
             AVG(g.score) AS avg_score
      FROM grades g
      JOIN assessments a ON a.id = g.assessment_id
      JOIN course_offerings o ON o.id = a.offering_id
      JOIN courses c ON c.id = o.course_id
      WHERE g.score IS NOT NULL
      GROUP BY c.id, c.code, c.title
      ORDER BY c.title
    `);
    res.json({ results: rows.map((r) => ({ courseCode: r.course_code, courseTitle: r.course_title, grades: Number(r.grades), avgScore: r.avg_score == null ? null : Number(Number(r.avg_score).toFixed(2)) })) });
  } catch (error) { next(error); }
});
router.post('/reports/export', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO data_export_logs (module_code, entity_name, file_type, file_name, exported_by, row_count) VALUES (?, ?, ?, ?, ?, ?)', [b.module_code || 'reports', b.entity_name || 'report', b.file_type || 'csv', b.file_name || null, req.user.sub, b.row_count || 0]);
    res.status(201).json({ exportId: r.insertId });
  } catch (error) { next(error); }
});

// ---------- Users & Roles ----------
router.get('/users', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.username, u.role, u.is_active, u.created_at, u.last_login_at,
             (SELECT GROUP_CONCAT(r.role_name) FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id WHERE ur.user_id = u.id AND ur.is_active = 1) AS role_names
      FROM users u ORDER BY u.id DESC
    `);
    res.json({ users: rows });
  } catch (error) { next(error); }
});
router.post('/users', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const username = asText(b.username, 'Username');
    const password = asText(b.password ?? 'Password123!', 'Password');
    const role = b.role || 'student';
    const bcrypt = await import('bcryptjs');
    const [r] = await pool.execute('INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, ?, ?)', [username, await bcrypt.default.hash(password, 10), role, b.is_active ?? 1]);
    res.status(201).json({ userId: r.insertId });
  } catch (error) { next(error); }
});
router.patch('/users/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id); const b = req.body ?? {};
    const fields = []; const params = [];
    if (b.username !== undefined) { fields.push('username = ?'); params.push(b.username); }
    if (b.role !== undefined) { fields.push('role = ?'); params.push(b.role); }
    if (b.is_active !== undefined) { fields.push('is_active = ?'); params.push(b.is_active ? 1 : 0); }
    if (b.password) {
      const bcrypt = await import('bcryptjs');
      fields.push('password_hash = ?'); params.push(await bcrypt.default.hash(b.password, 10));
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});
router.delete('/users/:id', async (req, res, next) => {
  try { await pool.execute('DELETE FROM users WHERE id = ?', [Number(req.params.id)]); res.json({ deleted: true }); }
  catch (error) { next(error); }
});

router.get('/roles', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT role_id, role_code, role_name, description, is_system_role, is_active, created_at FROM roles ORDER BY role_name');
    res.json({ roles: rows });
  } catch (error) { next(error); }
});
router.post('/roles', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO roles (role_code, role_name, description, is_system_role, is_active) VALUES (?, ?, ?, ?, ?)', [b.role_code, b.role_name, b.description || null, b.is_system_role ? 1 : 0, b.is_active ?? 1]);
    res.status(201).json({ roleId: r.insertId });
  } catch (error) { next(error); }
});

router.get('/permissions', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT permission_id, permission_code, resource, action, description FROM permissions ORDER BY resource, action');
    res.json({ permissions: rows });
  } catch (error) { next(error); }
});

router.get('/role-permission-map', async (req, res, next) => {
  try {
    const roleId = req.query.role_id ? Number(req.query.role_id) : null;
    const conditions = []; const params = [];
    if (roleId) { conditions.push('rpm.role_id = ?'); params.push(roleId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT rpm.role_id, rpm.permission_id, r.role_name, p.permission_code, p.resource, p.action FROM role_permission_map rpm JOIN roles r ON r.role_id = rpm.role_id JOIN permissions p ON p.permission_id = rpm.permission_id ${where}`, params);
    res.json({ mappings: rows });
  } catch (error) { next(error); }
});
router.post('/role-permission-map', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    await pool.execute('INSERT IGNORE INTO role_permission_map (role_id, permission_id) VALUES (?, ?)', [b.role_id, b.permission_id]);
    res.status(201).json({ created: true });
  } catch (error) { next(error); }
});
router.delete('/role-permission-map', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM role_permission_map WHERE role_id = ? AND permission_id = ?', [req.body.role_id, req.body.permission_id]);
    res.json({ deleted: true });
  } catch (error) { next(error); }
});

router.get('/user-roles', async (req, res, next) => {
  try {
    const userId = req.query.user_id ? Number(req.query.user_id) : null;
    const conditions = []; const params = [];
    if (userId) { conditions.push('ur.user_id = ?'); params.push(userId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT ur.user_role_id, ur.user_id, ur.role_id, ur.is_default, ur.is_active, ur.assigned_at, r.role_name, r.role_code, u.username FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id JOIN users u ON u.id = ur.user_id ${where} ORDER BY ur.assigned_at DESC`, params);
    res.json({ userRoles: rows });
  } catch (error) { next(error); }
});
router.post('/user-roles', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO user_roles (user_id, role_id, is_default, is_active, assigned_by) VALUES (?, ?, ?, ?, ?)', [b.user_id, b.role_id, b.is_default ? 1 : 0, b.is_active ?? 1, req.user.sub]);
    res.status(201).json({ userRoleId: r.insertId });
  } catch (error) { next(error); }
});

router.get('/user-sessions', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT session_id, user_id, ip_address, user_agent, login_at, logout_at, revoked_at FROM user_sessions ORDER BY login_at DESC LIMIT 100');
    res.json({ sessions: rows });
  } catch (error) { next(error); }
});

// ---------- Settings & Audit Log ----------
router.get('/settings/site', async (_req, res, next) => {
  try { const [rows] = await pool.query('SELECT setting_key, setting_value, updated_at FROM site_settings'); res.json({ settings: rows }); }
  catch (error) { next(error); }
});
router.put('/settings/site', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    for (const [key, value] of Object.entries(b)) {
      await pool.execute('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [key, String(value)]);
    }
    res.json({ updated: true });
  } catch (error) { next(error); }
});

router.get('/settings/academic', async (_req, res, next) => {
  try { const [rows] = await pool.query('SELECT setting_id, setting_key, setting_value, description, updated_by, updated_at FROM academic_settings'); res.json({ settings: rows }); }
  catch (error) { next(error); }
});
router.put('/settings/academic', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    for (const [key, value] of Object.entries(b)) {
      await pool.execute('UPDATE academic_settings SET setting_value = ? WHERE setting_key = ?', [String(value), key]);
    }
    res.json({ updated: true });
  } catch (error) { next(error); }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 100)));
    const [rows] = await pool.query(`
      SELECT al.audit_id, al.actor_user_id, al.user_id, al.action, al.entity_type, al.entity_id, al.details, al.ip_address, al.user_agent, al.created_at,
             u.username AS actor_username
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.actor_user_id
      ORDER BY al.created_at DESC LIMIT ?
    `, [limit]);
    const [changes] = await pool.query('SELECT change_id, audit_id, field_name, old_value, new_value FROM audit_log_changes ORDER BY change_id DESC LIMIT 200');
    res.json({ auditLogs: rows, changes });
  } catch (error) { next(error); }
});

export default router;

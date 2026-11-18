import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../../config/database.js';
import { authenticate, allowRoles } from '../../middleware/authenticate.js';
import { writeAuditLog } from '../../utils/audit.js';

const router = Router();

const normalizeStudentSummary = (row) => ({
  student_number: row.student_number,
  first_name: row.first_name,
  last_name: row.last_name,
  program: row.program ?? 'Not assigned',
  enrollment_year: row.enrollment_year ?? null,
  email: row.email ?? null,
  phone: row.phone ?? null,
  status: row.status ?? 'active',
  academic_year: row.academic_year ?? null,
  semester_name: row.semester_name ?? null,
  section: row.section ?? null,
  dormitory: row.dormitory ?? null,
});

// All dashboard endpoints require a valid token and the appropriate role.
router.get('/admin', authenticate, allowRoles('admin'), async (_req, res, next) => {
  try {
    const [[studentCount]] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [[teacherCount]] = await pool.query('SELECT COUNT(*) AS total FROM teachers');
    const [[userCount]] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [students] = await pool.query(`
      SELECT s.student_number, s.first_name, s.last_name,
             COALESCE(p.name, s.program, 'Not assigned') AS program,
             s.enrollment_year, s.status
      FROM students s
      LEFT JOIN programs p ON p.id = s.program_id
      ORDER BY s.id DESC LIMIT 100
    `);

    res.json({
      totals: {
        students: Number(studentCount.total),
        teachers: Number(teacherCount.total),
        users: Number(userCount.total),
      },
      students: students.map((student) => ({
        student_number: student.student_number,
        first_name: student.first_name,
        last_name: student.last_name,
        program: student.program,
        enrollment_year: student.enrollment_year,
        status: student.status,
      })),
    });
  } catch (error) { next(error); }
});

router.get('/teacher', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const [teacherRows] = req.user.role === 'admin'
      ? await pool.query(`SELECT * FROM teachers ORDER BY id DESC LIMIT 1`)
      : await pool.execute(`SELECT * FROM teachers WHERE user_id = ? LIMIT 1`, [req.user.sub]);

    if (!teacherRows[0] && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Teacher profile not found.' });
    }

    const teacherId = teacherRows[0]?.id ?? null;
    const [classRows] = await pool.query(`
      SELECT o.id AS offering_id,
             c.id AS course_id,
             c.code AS course_code,
             c.title AS course_title,
             o.section,
             o.room,
             s.name AS semester_name,
             s.is_current,
             (SELECT COUNT(*) FROM enrollments e WHERE e.offering_id = o.id AND e.status = 'enrolled') AS student_count,
             (SELECT MAX(CASE WHEN a.published = 1 THEN DATE(a.due_date) END) FROM assessments a WHERE a.offering_id = o.id) AS next_deadline,
             (SELECT COUNT(*)
              FROM assessments a
              LEFT JOIN grades g ON g.assessment_id = a.id
              WHERE a.offering_id = o.id AND a.published = 1 AND g.id IS NULL) AS pending_grades
      FROM course_offerings o
      JOIN courses c ON c.id = o.course_id
      JOIN semesters s ON s.id = o.semester_id
      WHERE (? IS NULL OR o.teacher_id = ?)
      ORDER BY s.is_current DESC, o.id DESC
    `, [teacherId, teacherId]);

    const classIds = classRows.map((row) => row.offering_id);

    const [rosterRows] = classIds.length
      ? await pool.query(`
          SELECT e.offering_id,
                 s.id AS student_id,
                 s.student_number,
                 s.first_name,
                 s.last_name,
                 COALESCE(p.name, s.program, 'Not assigned') AS program,
                 ROUND(AVG(CASE WHEN ar.status = 'present' THEN 1 WHEN ar.status = 'late' THEN 0.5 ELSE 0 END) * 100) AS attendance_pct,
                 COALESCE(
                   (SELECT ROUND(AVG((g.score / a.max_score) * 100))
                    FROM grades g
                    JOIN assessments a ON a.id = g.assessment_id
                    WHERE g.student_id = s.id AND a.offering_id = e.offering_id AND g.score IS NOT NULL),
                   0
                 ) AS current_grade_value
          FROM enrollments e
          JOIN students s ON s.id = e.student_id
          LEFT JOIN programs p ON p.id = s.program_id
          LEFT JOIN attendance_records ar ON ar.student_id = s.id
          LEFT JOIN attendance_sessions ars ON ars.id = ar.session_id AND ars.offering_id = e.offering_id
          WHERE e.offering_id IN (?)
            AND e.status = 'enrolled'
          GROUP BY e.offering_id, s.id, s.student_number, s.first_name, s.last_name, p.name, s.program
          ORDER BY s.last_name, s.first_name
        `, [classIds])
      : [[], null];

    const [assessmentRows] = classIds.length
      ? await pool.query(`
          SELECT a.id AS assessment_id,
                 a.offering_id,
                 a.title,
                 a.assessment_type,
                 a.max_score,
                 a.weight_percent,
                 a.due_date,
                 a.published,
                 g.id AS grade_id,
                 g.student_id,
                 g.score,
                 g.locked_at,
                 g.feedback
          FROM assessments a
          LEFT JOIN grades g ON g.assessment_id = a.id
          WHERE a.offering_id IN (?)
          ORDER BY a.offering_id, a.due_date, a.id
        `, [classIds])
      : [[], null];

    const [announcementRows] = await pool.query(`
      SELECT a.id,
             a.title,
             a.body,
             a.audience,
             a.published_at,
             CONCAT('/announcements#', a.id) AS link_url
      FROM announcements a
      WHERE a.status = 'published'
        AND (a.audience = 'teachers' OR a.audience = 'everyone' OR a.audience = 'students')
      ORDER BY a.published_at DESC
      LIMIT 8
    `);

    const classes = classRows.map((offering) => {
      const roster = rosterRows
        .filter((row) => row.offering_id === offering.offering_id)
        .map((row) => ({
          id: row.student_id,
          student_number: row.student_number,
          first_name: row.first_name,
          last_name: row.last_name,
          program: row.program ?? 'Not assigned',
          attendance_pct: Number(row.attendance_pct ?? 0),
          current_grade_value: row.current_grade_value == null ? null : Number(row.current_grade_value),
          current_grade: row.current_grade_value == null ? '—' : `${Number(row.current_grade_value)}%`,
          grades: {},
        }));

      const gradesByStudent = new Map();
      for (const assessment of assessmentRows.filter((row) => row.offering_id === offering.offering_id)) {
        if (assessment.student_id == null) continue;
        if (!gradesByStudent.has(assessment.student_id)) {
          gradesByStudent.set(assessment.student_id, {});
        }
        gradesByStudent.get(assessment.student_id)[assessment.assessment_id] = {
          grade_id: assessment.grade_id,
          value: assessment.score == null ? null : Number(assessment.score),
          locked_at: assessment.locked_at,
          max_score: Number(assessment.max_score),
        };
      }

      for (const student of roster) {
        student.grades = gradesByStudent.get(student.id) ?? {};
      }

      const assessments = assessmentRows
        .filter((row) => row.offering_id === offering.offering_id && row.assessment_id)
        .reduce((acc, row) => {
          if (!acc.some((entry) => entry.id === row.assessment_id)) {
            acc.push({
              id: row.assessment_id,
              title: row.title,
              type: row.assessment_type,
              max_score: Number(row.max_score),
              weight: Number(row.weight_percent),
              due_date: row.due_date,
              published: Boolean(row.published),
            });
          }
          return acc;
        }, []);

      const classAnnouncements = announcementRows.filter((item) => item.audience === 'teachers' || item.audience === 'everyone');

      return {
        id: offering.offering_id,
        course_code: offering.course_code,
        course_title: offering.course_title,
        section: offering.section,
        room: offering.room,
        semester_name: offering.semester_name,
        student_count: Number(offering.student_count || 0),
        next_class: offering.next_deadline ? new Date(offering.next_deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'No upcoming assessment',
        pending_grades: Number(offering.pending_grades || 0),
        roster,
        assessments,
        announcements: classAnnouncements.slice(0, 4),
        timetable: [
          { day: 'Mon', time: '09:00 - 11:00', room: offering.room || 'Lab 1', course_title: offering.course_title },
          { day: 'Wed', time: '13:00 - 15:00', room: offering.room || 'Lab 1', course_title: offering.course_title },
        ],
      };
    });

    const teacherSummary = {
      teacher: teacherRows[0] ? {
        id: teacherRows[0].id,
        employee_number: teacherRows[0].employee_number,
        first_name: teacherRows[0].first_name,
        last_name: teacherRows[0].last_name,
        department: teacherRows[0].department ?? 'Academic Affairs',
        status: teacherRows[0].status ?? 'active',
      } : {
        id: 0,
        employee_number: 'N/A',
        first_name: 'Instructor',
        last_name: 'Profile',
        department: 'Academic Affairs',
        status: 'active',
      },
      totals: {
        courses: classes.length,
        pending_grades: classes.reduce((sum, offering) => sum + (offering.pending_grades || 0), 0),
        low_attendance: classes.reduce((sum, offering) => sum + offering.roster.filter((student) => student.attendance_pct < 75).length, 0),
        announcements: announcementRows.length,
      },
      classes,
      announcements: announcementRows,
    };

    return res.json(teacherSummary);
  } catch (error) { next(error); }
});

router.get('/teacher/classes/:classId', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const classId = Number(req.params.classId);
    if (!Number.isFinite(classId) || classId <= 0) {
      return res.status(400).json({ message: 'A valid class id is required.' });
    }

    const [profileRows] = await pool.execute('SELECT id FROM teachers WHERE user_id = ? LIMIT 1', [req.user.sub]);
    const teacherId = req.user.role === 'admin' ? null : profileRows[0]?.id ?? null;

    const [classRows] = await pool.query(`
      SELECT o.id AS offering_id, c.code AS course_code, c.title AS course_title, o.section, o.room, s.name AS semester_name
      FROM course_offerings o
      JOIN courses c ON c.id = o.course_id
      JOIN semesters s ON s.id = o.semester_id
      WHERE o.id = ? AND (? IS NULL OR o.teacher_id = ?)
      LIMIT 1
    `, [classId, teacherId, teacherId]);

    if (!classRows[0]) {
      return res.status(403).json({ message: 'This class is not assigned to you.' });
    }

    const [gradeRows] = await pool.query(`
      SELECT a.id AS assessment_id, a.title, a.assessment_type, a.max_score, a.weight_percent, a.due_date,
             g.id AS grade_id, g.student_id, g.score, g.locked_at, g.feedback
      FROM assessments a
      LEFT JOIN grades g ON g.assessment_id = a.id
      WHERE a.offering_id = ?
      ORDER BY a.id, g.student_id
    `, [classId]);

    const [rosterRows] = await pool.query(`
      SELECT s.id AS student_id, s.student_number, s.first_name, s.last_name,
             COALESCE(p.name, s.program) AS program
      FROM enrollments e
      JOIN students s ON s.id = e.student_id
      LEFT JOIN programs p ON p.id = s.program_id
      WHERE e.offering_id = ? AND e.status = 'enrolled'
      ORDER BY s.last_name, s.first_name
    `, [classId]);

    return res.json({
      id: classRows[0].offering_id,
      course_code: classRows[0].course_code,
      course_title: classRows[0].course_title,
      section: classRows[0].section,
      room: classRows[0].room,
      semester_name: classRows[0].semester_name,
      roster: rosterRows,
      assessments: gradeRows,
    });
  } catch (error) { next(error); }
});

router.post('/teacher/classes/:classId/announcements', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const classId = Number(req.params.classId);
    if (!Number.isFinite(classId) || classId <= 0) {
      return res.status(400).json({ message: 'A valid class id is required.' });
    }

    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and notice text are required.' });
    }

    const [profileRows] = await pool.execute('SELECT id FROM teachers WHERE user_id = ? LIMIT 1', [req.user.sub]);
    const teacherId = req.user.role === 'admin' ? null : profileRows[0]?.id ?? null;

    const [classRows] = await pool.query(`
      SELECT o.id
      FROM course_offerings o
      WHERE o.id = ? AND (? IS NULL OR o.teacher_id = ?)
      LIMIT 1
    `, [classId, teacherId, teacherId]);

    if (!classRows[0]) {
      return res.status(403).json({ message: 'You can only post notices for classes assigned to you.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO announcements (title, body, audience, status, published_at, created_by) VALUES (?, ?, ?, ?, NOW(), ?)',
      [title, body, 'students', 'published', req.user.sub],
    );

    await writeAuditLog({
      actorUserId: req.user.sub,
      action: 'announcement_created',
      entityType: 'announcement',
      entityId: result.insertId,
      details: { class_id: classId, title },
      request: req,
    });

    return res.status(201).json({ id: result.insertId, title, body, audience: 'students' });
  } catch (error) { next(error); }
});

router.put('/teacher/profile/password', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, req.user.sub]);

    await writeAuditLog({
      actorUserId: req.user.sub,
      userId: req.user.sub,
      action: 'password_changed',
      entityType: 'user',
      entityId: req.user.sub,
      details: { changed_by: 'teacher_self_service' },
      request: req,
    });

    return res.json({ changed: true });
  } catch (error) { next(error); }
});

router.get('/student', authenticate, allowRoles('student'), async (req, res, next) => {
  try {

    // No GROUP BY: section and academic year come from subqueries, so this runs under ONLY_FULL_GROUP_BY (MySQL 8 default).
    const [studentRows] = await pool.query(`
      SELECT s.id, s.student_number, s.first_name, s.last_name,
             COALESCE(s.program, p.name, 'Not assigned') AS program,
             s.enrollment_year, s.status, s.email, s.phone,
             COALESCE(
               (SELECT ay.name FROM academic_years ay WHERE ay.is_current = 1 ORDER BY ay.id DESC LIMIT 1),
               CONCAT(s.enrollment_year, '/', (s.enrollment_year + 1))
             ) AS academic_year,
             CASE
               WHEN s.id % 4 = 0 THEN 'Dormitory A-08'
               WHEN s.id % 4 = 1 THEN 'Dormitory B-12'
               WHEN s.id % 4 = 2 THEN 'Dormitory C-05'
               ELSE 'Dormitory D-17'
             END AS dormitory,
             'Current semester' AS semester_name,
             COALESCE(
               (SELECT o2.section
                  FROM enrollments e2
                  JOIN course_offerings o2 ON o2.id = e2.offering_id
                  JOIN semesters sem2 ON sem2.id = o2.semester_id AND sem2.is_current = 1
                 WHERE e2.student_id = s.id
                 ORDER BY o2.id ASC
                 LIMIT 1),
               'A'
             ) AS section
      FROM students s
      LEFT JOIN programs p ON p.id = s.program_id
      WHERE s.user_id = ?
      LIMIT 1
    `, [req.user.sub]);

    const student = studentRows[0] ?? null;

    if (!student) {
      return res.status(404).json({ message: 'Student record not found.' });
    }

    const [currentSemesterRows] = await pool.query(`
      SELECT sem.id, sem.name AS semester_name, ay.name AS academic_year
      FROM semesters sem
      JOIN academic_years ay ON ay.id = sem.academic_year_id
      WHERE sem.is_current = 1 OR ay.is_current = 1
      ORDER BY sem.is_current DESC, ay.is_current DESC
      LIMIT 1
    `);

    const currentSemester = currentSemesterRows[0] ?? { id: null, semester_name: 'Current semester', academic_year: student.academic_year || '2026/2027' };

    const [announcements] = await pool.query(`
      SELECT id, title, body, published_at,
             CONCAT('/announcements#', id) AS link_url
      FROM announcements
      WHERE status = 'published'
        AND (audience = 'students' OR audience = 'everyone')
        AND published_at IS NOT NULL
        AND published_at <= NOW()
      ORDER BY published_at DESC
      LIMIT 5
    `);

    const [calendarRows] = await pool.query(`
      SELECT title, summary, starts_at, ends_at, location
      FROM events
      WHERE status = 'published'
        AND starts_at >= NOW()
      ORDER BY starts_at ASC
      LIMIT 6
    `);

    const [moduleRows] = await pool.query(`
      SELECT c.code, c.title,
             CONCAT(t.first_name, ' ', t.last_name) AS teacher,
             ROUND(AVG(CASE WHEN a.published = 1 AND g.published = 1 AND g.score IS NOT NULL THEN (g.score / a.max_score) * 100 ELSE 0 END), 0) AS progress
      FROM enrollments e
      JOIN course_offerings o ON o.id = e.offering_id
      JOIN courses c ON c.id = o.course_id
      LEFT JOIN teachers t ON t.id = o.teacher_id
      LEFT JOIN assessments a ON a.offering_id = o.id AND a.published = 1
      LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id AND g.published = 1
      WHERE e.student_id = ?
        AND o.semester_id = COALESCE((SELECT id FROM semesters WHERE is_current = 1 LIMIT 1), o.semester_id)
      GROUP BY c.id, c.code, c.title, t.first_name, t.last_name
      ORDER BY c.title ASC
      LIMIT 4
    `, [student.id]);

    const modules = moduleRows.map((row, index) => ({
      code: row.code,
      title: row.title,
      teacher: row.teacher || 'Instructor not assigned',
      progress: Number(row.progress || 0),
      color: ['gold', 'blue', 'green', 'rose'][index % 4],
    }));

    const [assignmentRows] = await pool.query(`
      SELECT a.title, c.title AS course, a.due_at, a.status,
             CASE
               WHEN a.due_at IS NULL THEN 'No deadline'
               WHEN a.due_at < NOW() THEN 'Due now'
               WHEN a.due_at <= DATE_ADD(NOW(), INTERVAL 7 DAY) THEN 'Upcoming'
               ELSE 'Planned'
             END AS state
      FROM assignments a
      JOIN course_offerings o ON o.id = a.offering_id
      JOIN courses c ON c.id = o.course_id
      JOIN enrollments e ON e.offering_id = o.id
      WHERE e.student_id = ?
        AND a.status = 'published'
      ORDER BY a.due_at ASC, a.title ASC
      LIMIT 5
    `, [student.id]);

    const tasks = assignmentRows.map((row) => ({
      title: row.title,
      course: row.course,
      due: row.due_at ? new Date(row.due_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      }) : 'No due date',
      status: row.state,
      tone: row.state === 'Due now' ? 'warning' : row.state === 'Upcoming' ? 'info' : 'success',
    }));

    const [scheduleRows] = await pool.query(`
      SELECT te.weekday, te.starts_at, te.ends_at, te.room,
             c.code, c.title AS course_title,
             CONCAT(t.first_name, ' ', t.last_name) AS teacher
      FROM timetable_entries te
      JOIN course_offerings o ON o.id = te.offering_id
      JOIN enrollments e ON e.offering_id = o.id
      JOIN courses c ON c.id = o.course_id
      LEFT JOIN teachers t ON t.id = o.teacher_id
      WHERE e.student_id = ?
        AND o.semester_id = COALESCE((SELECT id FROM semesters WHERE is_current = 1 LIMIT 1), o.semester_id)
      ORDER BY te.weekday ASC, te.starts_at ASC
    `, [student.id]);

    const [attendanceRows] = await pool.query(`
      SELECT ar.status, ad.session_date
      FROM attendance_records ar
      JOIN attendance_sessions ad ON ad.id = ar.session_id
      WHERE ar.student_id = ?
      ORDER BY ad.session_date ASC
    `, [student.id]);

    const attendance = attendanceRows.map((row) => ({
      status: row.status,
      session_date: row.session_date,
    }));

    const dailyAttendance = attendance.map((entry) => ({
      date: entry.session_date,
      status: entry.status,
    }));

    const ownPresentCount = attendance.filter((row) => row.status === 'present').length;
    const percentage = attendance.length ? Math.round((ownPresentCount / attendance.length) * 100) : 0;

    const [gradeRows] = await pool.query(`
      SELECT c.code, c.title AS course_title,
             CONCAT(ay.name, ' / ', sem.name) AS term_name,
             a.title AS assessment_title,
             a.max_score,
             g.score,
             g.published,
             a.due_date,
             a.weight_percent
      FROM grades g
      JOIN assessments a ON a.id = g.assessment_id
      JOIN course_offerings o ON o.id = a.offering_id
      JOIN courses c ON c.id = o.course_id
      JOIN semesters sem ON sem.id = o.semester_id
      JOIN academic_years ay ON ay.id = sem.academic_year_id
      WHERE g.student_id = ?
        AND g.published = 1
        AND a.published = 1
      ORDER BY ay.name DESC, sem.id DESC, c.title ASC, a.due_date ASC
    `, [student.id]);

    const [resourceRows] = await pool.query(`
      SELECT id, title, description, category, file_url, audience
      FROM resources
      WHERE published = 1
        AND audience IN ('students', 'public')
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const profile = normalizeStudentSummary({
      ...student,
      semester_name: currentSemester.semester_name,
      academic_year: currentSemester.academic_year || student.academic_year || '2026/2027',
      dormitory: student.dormitory || 'Dormitory A-01',
      section: student.section || 'A',
    });

    res.json({
      student: profile,
      announcements,
      calendar: calendarRows,
      modules,
      schedule: scheduleRows,
      tasks,
      grades: gradeRows,
      resources: resourceRows,
      dailyAttendance,
      attendance: {
        percentage,
        total_sessions: attendance.length,
        present: ownPresentCount,
        absent: attendance.filter((row) => row.status === 'absent').length,
        late: attendance.filter((row) => row.status === 'late').length,
      },
      academic_year: currentSemester.academic_year || profile.academic_year,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/grades/:id', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const gradeId = Number(req.params.id);
    if (!Number.isFinite(gradeId) || gradeId <= 0) {
      return res.status(400).json({ message: 'Grade id must be a positive number.' });
    }

    const score = Number(req.body?.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return res.status(400).json({ message: 'Grade score must be a number between 0 and 100.' });
    }

    const feedback = typeof req.body?.feedback === 'string' ? req.body.feedback.trim() : null;
    const shouldLock = req.body?.lock === true;
    const [existingRows] = await pool.query(
      `SELECT g.id, g.assessment_id, g.student_id, g.score, a.offering_id, o.teacher_id
       FROM grades g
       JOIN assessments a ON a.id = g.assessment_id
       JOIN course_offerings o ON o.id = a.offering_id
       WHERE g.id = ? LIMIT 1`,
      [gradeId],
    );

    if (!existingRows[0]) {
      return res.status(404).json({ message: 'Grade not found.' });
    }

    if (req.user.role !== 'admin') {
      const [teacherRows] = await pool.execute('SELECT id FROM teachers WHERE user_id = ? LIMIT 1', [req.user.sub]);
      if (!teacherRows[0] || teacherRows[0].id !== existingRows[0].teacher_id) {
        return res.status(403).json({ message: 'You can only update grades for your own classes.' });
      }
    }
    if (existingRows[0].locked_at && !req.body?.force_unlock) {
      return res.status(409).json({ message: 'Grade is locked after submission. Use correction flow.' });
    }

    const teacherId = req.user.role === 'admin'
      ? existingRows[0].teacher_id
      : (await pool.execute('SELECT id FROM teachers WHERE user_id = ? LIMIT 1', [req.user.sub]))[0][0]?.id ?? null;

    if (shouldLock) {
      await pool.execute(
        `UPDATE grades
         SET score = ?, feedback = ?, published = 0, graded_by = ?, graded_at = NOW(),
             workflow_status = 'submitted', locked_at = NOW(), submitted_by = ?, submitted_at = NOW()
         WHERE id = ?`,
        [score, feedback || null, teacherId, req.user.sub, gradeId],
      );
      await pool.execute('INSERT INTO grade_lock_history (grade_id, locked_by, reason) VALUES (?, ?, ?)', [gradeId, req.user.sub, 'Submitted by instructor']);
    } else {
      await pool.execute(
        `UPDATE grades
         SET score = ?, feedback = ?, published = 1, graded_by = ?, graded_at = NOW()
         WHERE id = ?`,
        [score, feedback || null, teacherId, gradeId],
      );
    }

    await writeAuditLog({
      actorUserId: req.user.sub,
      userId: existingRows[0].student_id,
      action: 'grade_updated',
      entityType: 'grade',
      entityId: gradeId,
      details: {
        assessment_id: existingRows[0].assessment_id,
        old_score: existingRows[0].score,
        new_score: score,
      },
      request: req,
    });

    return res.json({ updated: true, grade_id: gradeId, score });
  } catch (error) {
    return next(error);
  }
});

router.delete('/grades/:id', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const gradeId = Number(req.params.id);
    if (!Number.isFinite(gradeId) || gradeId <= 0) {
      return res.status(400).json({ message: 'Grade id must be a positive number.' });
    }

    const [existingRows] = await pool.query(
      `SELECT g.id, g.assessment_id, g.student_id, g.score, o.teacher_id
       FROM grades g
       JOIN assessments a ON a.id = g.assessment_id
       JOIN course_offerings o ON o.id = a.offering_id
       WHERE g.id = ? LIMIT 1`,
      [gradeId],
    );

    if (!existingRows[0]) {
      return res.status(404).json({ message: 'Grade not found.' });
    }

    if (req.user.role !== 'admin') {
      const [teacherRows] = await pool.execute('SELECT id FROM teachers WHERE user_id = ? LIMIT 1', [req.user.sub]);
      if (!teacherRows[0] || teacherRows[0].id !== existingRows[0].teacher_id) {
        return res.status(403).json({ message: 'You can only delete grades for your own classes.' });
      }
    }

    await pool.execute('DELETE FROM grades WHERE id = ?', [gradeId]);

    await writeAuditLog({
      actorUserId: req.user.sub,
      userId: existingRows[0].student_id,
      action: 'grade_deleted',
      entityType: 'grade',
      entityId: gradeId,
      details: {
        assessment_id: existingRows[0].assessment_id,
        deleted_score: existingRows[0].score,
      },
      request: req,
    });

    return res.json({ deleted: true, grade_id: gradeId });
  } catch (error) {
    return next(error);
  }
});

router.get('/admin/overview', authenticate, allowRoles('admin'), async (_req, res, next) => {
  try {
    const [[studentCount]] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [[teacherCount]] = await pool.query('SELECT COUNT(*) AS total FROM teachers');
    const [[activeOfferings]] = await pool.query("SELECT COUNT(*) AS total FROM course_offerings WHERE status = 'open'");
    const [[todayAttendance]] = await pool.query(`
      SELECT
        COUNT(ar.id) AS total_records,
        SUM(CASE WHEN ar.status = 'present' THEN 1 WHEN ar.status = 'late' THEN 0.5 ELSE 0 END) AS present_weighted
      FROM attendance_sessions s
      LEFT JOIN attendance_records ar ON ar.session_id = s.id
      WHERE s.session_date = CURDATE()
    `);
    const totalRecords = Number(todayAttendance.total_records || 0);
    const presentWeighted = Number(todayAttendance.present_weighted || 0);
    const attendanceRate = totalRecords > 0 ? Math.round((presentWeighted / totalRecords) * 100) : null;

    const [upcomingExams] = await pool.query(`
      SELECT es.schedule_id, es.exam_date, es.starts_at, es.ends_at, es.status,
             a.title AS assessment_title, a.assessment_type,
             c.code AS course_code, c.title AS course_title,
             r.room_code, r.room_name
      FROM exam_schedules es
      JOIN assessments a ON a.id = es.assessment_id
      JOIN course_offerings o ON o.id = a.offering_id
      JOIN courses c ON c.id = o.course_id
      LEFT JOIN rooms r ON r.room_id = es.room_id
      WHERE es.exam_date >= CURDATE()
      ORDER BY es.exam_date ASC, es.starts_at ASC
      LIMIT 5
    `);

    const [upcomingEvents] = await pool.query(`
      SELECT event_id, title, event_type, starts_at, ends_at, location
      FROM academic_calendar_events
      WHERE starts_at >= NOW()
      ORDER BY starts_at ASC
      LIMIT 5
    `);

    const [recentActivity] = await pool.query(`
      SELECT al.audit_id, al.action, al.entity_type, al.entity_id, al.created_at,
             u.username AS actor_username
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.actor_user_id
      ORDER BY al.created_at DESC
      LIMIT 8
    `);

    res.json({
      kpis: {
        students: Number(studentCount.total),
        staff: Number(teacherCount.total),
        activeCourses: Number(activeOfferings.total),
        todayAttendanceRate: attendanceRate,
      },
      upcomingExams: upcomingExams.map((r) => ({
        scheduleId: r.schedule_id,
        examDate: r.exam_date,
        startsAt: r.starts_at,
        endsAt: r.ends_at,
        status: r.status,
        assessmentTitle: r.assessment_title,
        assessmentType: r.assessment_type,
        courseCode: r.course_code,
        courseTitle: r.course_title,
        room: r.room_name || r.room_code || null,
      })),
      upcomingEvents: upcomingEvents.map((r) => ({
        eventId: r.event_id,
        title: r.title,
        eventType: r.event_type,
        startsAt: r.starts_at,
        endsAt: r.ends_at,
        location: r.location,
      })),
      recentActivity: recentActivity.map((r) => ({
        id: r.audit_id,
        action: r.action,
        entityType: r.entity_type,
        entityId: r.entity_id,
        createdAt: r.created_at,
        actor: r.actor_username,
      })),
    });
  } catch (error) { next(error); }
});

// ---------- Teacher-scoped endpoints (ownership enforced) ----------
async function getTeacherIdForUser(userId, role) {
  if (role === 'admin') return null; // admin bypass
  const [rows] = await pool.execute('SELECT id FROM teachers WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0]?.id ?? null;
}

async function ownsOffering(userId, role, offeringId) {
  if (role === 'admin') return true;
  const tid = await getTeacherIdForUser(userId, role);
  if (tid == null) return false;
  const [rows] = await pool.query('SELECT id FROM course_offerings WHERE id = ? AND teacher_id = ? LIMIT 1', [offeringId, tid]);
  return !!rows[0];
}

router.post('/teacher/classes/:classId/assessments', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const classId = Number(req.params.classId);
    if (!(await ownsOffering(req.user.sub, req.user.role, classId))) return res.status(403).json({ message: 'Not your class.' });
    const b = req.body ?? {};
    const [r] = await pool.execute('INSERT INTO assessments (offering_id, title, assessment_type, max_score, weight_percent, due_date, published) VALUES (?, ?, ?, ?, ?, ?, ?)', [classId, b.title, b.assessment_type || 'test', b.max_score || 100, b.weight_percent || 0, b.due_date || null, b.published ? 1 : 0]);
    res.status(201).json({ assessmentId: r.insertId });
  } catch (error) { next(error); }
});

router.put('/teacher/assessments/:id', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query('SELECT a.id, o.teacher_id, o.id AS offering_id FROM assessments a JOIN course_offerings o ON o.id = a.offering_id WHERE a.id = ? LIMIT 1', [id]);
    if (!rows[0]) return res.status(404).json({ message: 'Assessment not found.' });
    if (!(await ownsOffering(req.user.sub, req.user.role, rows[0].offering_id))) return res.status(403).json({ message: 'Not your class.' });
    const b = req.body ?? {};
    const fields = []; const params = [];
    for (const [col,key] of [['title','title'],['assessment_type','assessment_type'],['max_score','max_score'],['weight_percent','weight_percent'],['due_date','due_date'],['published','published']]) {
      if (b[key] !== undefined) { fields.push(`${col} = ?`); params.push(b[key] === '' ? null : (key==='published' ? (b[key]?1:0) : b[key])); }
    }
    if (fields.length) { params.push(id); await pool.execute(`UPDATE assessments SET ${fields.join(', ')} WHERE id = ?`, params); }
    res.json({ updated: true });
  } catch (error) { next(error); }
});

router.delete('/teacher/assessments/:id', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query('SELECT a.id, o.id AS offering_id FROM assessments a JOIN course_offerings o ON o.id = a.offering_id WHERE a.id = ? LIMIT 1', [id]);
    if (!rows[0]) return res.status(404).json({ message: 'Assessment not found.' });
    if (!(await ownsOffering(req.user.sub, req.user.role, rows[0].offering_id))) return res.status(403).json({ message: 'Not your class.' });
    await pool.execute('DELETE FROM assessments WHERE id = ?', [id]);
    res.json({ deleted: true });
  } catch (error) { next(error); }
});

router.post('/teacher/classes/:classId/attendance/sessions', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const classId = Number(req.params.classId);
    if (!(await ownsOffering(req.user.sub, req.user.role, classId))) return res.status(403).json({ message: 'Not your class.' });
    const b = req.body ?? {};
    if (!b.session_date) return res.status(400).json({ message: 'session_date required.' });
    const [r] = await pool.execute('INSERT INTO attendance_sessions (offering_id, session_date, topic, recorded_by) VALUES (?, ?, ?, ?)', [classId, b.session_date, b.topic || null, req.user.sub]);
    res.status(201).json({ sessionId: r.insertId });
  } catch (error) { next(error); }
});

router.put('/teacher/attendance/sessions/:id/records', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const sessionId = Number(req.params.id);
    const [sess] = await pool.query('SELECT offering_id FROM attendance_sessions WHERE id = ? LIMIT 1', [sessionId]);
    if (!sess[0]) return res.status(404).json({ message: 'Session not found.' });
    if (!(await ownsOffering(req.user.sub, req.user.role, sess[0].offering_id))) return res.status(403).json({ message: 'Not your class.' });
    const records = Array.isArray(req.body?.records) ? req.body.records : [];
    for (const rec of records) {
      const [existing] = await pool.execute('SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ? LIMIT 1', [sessionId, rec.student_id]);
      if (existing[0]) {
        await pool.execute('UPDATE attendance_records SET status = ?, note = ? WHERE id = ?', [rec.status || 'present', rec.note || null, existing[0].id]);
      } else {
        await pool.execute('INSERT INTO attendance_records (session_id, student_id, status, note) VALUES (?, ?, ?, ?)', [sessionId, rec.student_id, rec.status || 'present', rec.note || null]);
      }
    }
    res.json({ updated: true, count: records.length });
  } catch (error) { next(error); }
});

router.post('/teacher/classes/:classId/grades', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const classId = Number(req.params.classId);
    if (!(await ownsOffering(req.user.sub, req.user.role, classId))) return res.status(403).json({ message: 'Not your class.' });
    const b = req.body ?? {};
    const assessmentId = Number(b.assessment_id);
    const studentId = Number(b.student_id);
    if (!assessmentId || !studentId) return res.status(400).json({ message: 'assessment_id and student_id required.' });
    // verify assessment belongs to offering
    const [a] = await pool.query('SELECT id FROM assessments WHERE id = ? AND offering_id = ? LIMIT 1', [assessmentId, classId]);
    if (!a[0]) return res.status(404).json({ message: 'Assessment not found for this class.' });
    // upsert grade row
    const [existing] = await pool.query('SELECT id FROM grades WHERE assessment_id = ? AND student_id = ? LIMIT 1', [assessmentId, studentId]);
    if (existing[0]) return res.json({ gradeId: existing[0].id });
    const [r] = await pool.execute('INSERT INTO grades (assessment_id, student_id, score, workflow_status) VALUES (?, ?, NULL, ?)', [assessmentId, studentId, 'draft']);
    res.status(201).json({ gradeId: r.insertId });
  } catch (error) { next(error); }
});

router.get('/teacher/grading-scales', authenticate, allowRoles('teacher', 'admin'), async (_req, res, next) => {
  try {
    const [scales] = await pool.query('SELECT scale_id, scale_name, max_gpa, is_default, is_active FROM grading_scales ORDER BY is_default DESC, scale_id');
    const [rules] = await pool.query('SELECT rule_id, scale_id, minimum_score, maximum_score, letter_grade, grade_point, is_pass FROM grading_scale_rules ORDER BY scale_id, minimum_score');
    const grouped = scales.map((sc) => ({ ...sc, rules: rules.filter((r) => r.scale_id === sc.scale_id) }));
    res.json({ gradingScales: grouped });
  } catch (error) { next(error); }
});

router.get('/teacher/attendance/sessions', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const offeringId = req.query.offering_id ? Number(req.query.offering_id) : null;
    if (!offeringId) return res.status(400).json({ message: 'offering_id required.' });
    if (!(await ownsOffering(req.user.sub, req.user.role, offeringId))) return res.status(403).json({ message: 'Not your class.' });
    const [rows] = await pool.query(`
      SELECT s.id, s.offering_id, s.session_date, s.topic, s.recorded_by, s.created_at,
             c.code AS course_code, c.title AS course_title, o.section
      FROM attendance_sessions s
      JOIN course_offerings o ON o.id = s.offering_id
      JOIN courses c ON c.id = o.course_id
      WHERE s.offering_id = ?
      ORDER BY s.session_date DESC, s.id DESC
    `, [offeringId]);
    res.json({ sessions: rows });
  } catch (error) { next(error); }
});

router.get('/teacher/grades', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const offeringId = req.query.offering_id ? Number(req.query.offering_id) : null;
    if (!offeringId) return res.status(400).json({ message: 'offering_id required.' });
    if (!(await ownsOffering(req.user.sub, req.user.role, offeringId))) return res.status(403).json({ message: 'Not your class.' });
    const [rows] = await pool.query(`
      SELECT g.id AS grade_id, g.assessment_id, g.student_id, g.score, g.feedback, g.published, g.workflow_status,
             g.locked_at, g.graded_at, g.graded_by,
             a.title AS assessment_title, a.max_score, a.weight_percent, a.offering_id,
             s.student_number, s.first_name, s.last_name
      FROM grades g
      JOIN assessments a ON a.id = g.assessment_id
      JOIN students s ON s.id = g.student_id
      WHERE a.offering_id = ?
      ORDER BY a.id, s.last_name, s.first_name
    `, [offeringId]);
    res.json({ grades: rows });
  } catch (error) { next(error); }
});

router.post('/teacher/result-approval-batches', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const offeringId = Number(b.offering_id);
    if (!offeringId) return res.status(400).json({ message: 'offering_id required.' });
    if (!(await ownsOffering(req.user.sub, req.user.role, offeringId))) return res.status(403).json({ message: 'Not your class.' });
    const [r] = await pool.execute('INSERT INTO result_approval_batches (offering_id, submitted_by, status) VALUES (?, ?, ?)', [offeringId, req.user.sub, 'submitted']);
    if (Array.isArray(b.grade_ids)) {
      for (const gid of b.grade_ids) {
        await pool.execute('INSERT INTO result_approval_items (approval_batch_id, grade_id) VALUES (?, ?)', [r.insertId, gid]);
      }
    }
    res.status(201).json({ batchId: r.insertId });
  } catch (error) { next(error); }
});

router.get('/teacher/timetable', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const tid = await getTeacherIdForUser(req.user.sub, req.user.role);
    const [rows] = await pool.query(`
      SELECT te.id, te.offering_id, te.weekday, te.starts_at, te.ends_at, te.room, te.room_id, te.schedule_status,
             c.code AS course_code, c.title AS course_title, o.section, r.room_name
      FROM timetable_entries te
      JOIN course_offerings o ON o.id = te.offering_id
      JOIN courses c ON c.id = o.course_id
      LEFT JOIN rooms r ON r.room_id = te.room_id
      WHERE (? IS NULL OR o.teacher_id = ?)
      ORDER BY te.weekday, te.starts_at
    `, [tid, tid]);
    res.json({ entries: rows });
  } catch (error) { next(error); }
});

router.get('/teacher/announcements', authenticate, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const tid = await getTeacherIdForUser(req.user.sub, req.user.role);
    // announcements for teacher's offerings (class_group) or posted by teacher
    const [rows] = await pool.query(`
      SELECT a.id, a.title, a.body, a.audience, a.status, a.published_at, a.created_at, a.department_id, a.class_group_id
      FROM announcements a
      WHERE a.created_by = ? OR a.audience IN ('teachers','everyone')
      ORDER BY a.created_at DESC
      LIMIT 50
    `, [req.user.sub]);
    res.json({ announcements: rows });
  } catch (error) { next(error); }
});

// ---------- Student-scoped endpoints (own data only) ----------
// The student is resolved from the authenticated user and every query is
// keyed by that student id, so a student can never read another student's data.

const DEFAULT_GRADING_RULES = [
  { minimum_score: 80, maximum_score: 100, letter_grade: 'A', grade_point: 4.0, is_pass: 1 },
  { minimum_score: 70, maximum_score: 79.99, letter_grade: 'B', grade_point: 3.0, is_pass: 1 },
  { minimum_score: 60, maximum_score: 69.99, letter_grade: 'C', grade_point: 2.0, is_pass: 1 },
  { minimum_score: 50, maximum_score: 59.99, letter_grade: 'D', grade_point: 1.0, is_pass: 1 },
  { minimum_score: 0, maximum_score: 49.99, letter_grade: 'F', grade_point: 0.0, is_pass: 0 },
];

async function getStudentContext(userId) {
  const [rows] = await pool.execute(`
    SELECT s.id, s.user_id, s.student_number, s.first_name, s.middle_name, s.last_name,
           s.program_id, s.class_group_id, s.enrollment_year, s.status, s.email, s.phone,
           DATE_FORMAT(s.date_of_birth, '%Y-%m-%d') AS date_of_birth,
           s.gender, s.photo_url, s.program AS program_label,
           p.name AS program_name, p.code AS program_code, p.department,
           p.qualification_level, p.duration_years,
           COALESCE(
             p.department_id,
             (SELECT d.department_id FROM departments d WHERE d.name = p.department ORDER BY d.department_id LIMIT 1)
           ) AS department_id,
           (SELECT sae.level_number FROM student_academic_enrollments sae
             WHERE sae.student_id = s.id
             ORDER BY sae.academic_enrollment_id DESC LIMIT 1) AS level_number
    FROM students s
    LEFT JOIN programs p ON p.id = s.program_id
    WHERE s.user_id = ?
    LIMIT 1
  `, [userId]);

  if (!rows[0]) return null;

  const [terms] = await pool.query(`
    SELECT sem.id, sem.name,
           DATE_FORMAT(sem.starts_on, '%Y-%m-%d') AS starts_on,
           DATE_FORMAT(sem.ends_on, '%Y-%m-%d') AS ends_on,
           sem.is_current,
           ay.name AS academic_year
    FROM semesters sem
    JOIN academic_years ay ON ay.id = sem.academic_year_id
    ORDER BY sem.is_current DESC, sem.starts_on DESC, sem.id DESC
  `);

  return { student: rows[0], terms, currentTerm: terms.find((t) => Number(t.is_current) === 1) ?? terms[0] ?? null };
}

async function loadGradingRules() {
  const [scales] = await pool.query(`
    SELECT scale_id, scale_name, max_gpa FROM grading_scales
    WHERE is_active = 1
    ORDER BY is_default DESC, scale_id
    LIMIT 1
  `);

  if (!scales[0]) {
    return { scale_name: 'Default grading scale', source: 'default', max_gpa: 4, rules: DEFAULT_GRADING_RULES };
  }

  const [rules] = await pool.query(`
    SELECT minimum_score, maximum_score, letter_grade, grade_point, is_pass
    FROM grading_scale_rules
    WHERE scale_id = ?
    ORDER BY minimum_score DESC
  `, [scales[0].scale_id]);

  if (!rules.length) {
    return {
      scale_name: 'Default grading scale',
      source: 'default',
      max_gpa: Number(scales[0].max_gpa) || 4,
      rules: DEFAULT_GRADING_RULES,
    };
  }

  return {
    scale_name: scales[0].scale_name,
    source: 'database',
    max_gpa: Number(scales[0].max_gpa) || 4,
    rules: rules.map((rule) => ({
      minimum_score: Number(rule.minimum_score),
      maximum_score: Number(rule.maximum_score),
      letter_grade: rule.letter_grade,
      grade_point: Number(rule.grade_point),
      is_pass: Number(rule.is_pass),
    })),
  };
}

function gradingRuleFor(percent, rules) {
  if (percent == null || !Number.isFinite(Number(percent))) return null;
  const value = Number(percent);
  const sorted = [...rules].sort((a, b) => Number(b.minimum_score) - Number(a.minimum_score));
  return sorted.find((rule) => value >= Number(rule.minimum_score)) ?? sorted[sorted.length - 1] ?? null;
}

async function getAttendanceThreshold() {
  const [rows] = await pool.query(`
    SELECT setting_value FROM academic_settings
    WHERE setting_key = 'low_attendance_threshold_percent'
    LIMIT 1
  `);
  const value = Number(rows[0]?.setting_value);
  return Number.isFinite(value) && value > 0 ? value : 75;
}

/**
 * Published results only (teacher submitted, registrar/college published),
 * grouped by course offering. Percent uses assessment weights when the
 * course defines them, otherwise raw marks.
 */
async function getStudentCourseResults(studentId, rules, { semesterId = null } = {}) {
  const params = [studentId];
  let termFilter = '';
  if (semesterId) {
    termFilter = ' AND o.semester_id = ?';
    params.push(semesterId);
  }

  const [rows] = await pool.query(`
    SELECT g.id AS grade_id, g.score, g.graded_at,
           a.id AS assessment_id, a.title AS assessment_title, a.assessment_type,
           a.max_score, a.weight_percent, a.due_date,
           o.id AS offering_id, o.section, o.room,
           c.code AS course_code, c.title AS course_title, c.credit_hours,
           sem.id AS semester_id, sem.name AS semester_name,
           ay.name AS academic_year,
           CONCAT(COALESCE(t.first_name, ''), ' ', COALESCE(t.last_name, '')) AS teacher
    FROM enrollments e
    JOIN course_offerings o ON o.id = e.offering_id
    JOIN courses c ON c.id = o.course_id
    JOIN semesters sem ON sem.id = o.semester_id
    JOIN academic_years ay ON ay.id = sem.academic_year_id
    LEFT JOIN teachers t ON t.id = o.teacher_id
    JOIN assessments a ON a.offering_id = o.id AND a.published = 1
    JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
                 AND g.published = 1 AND g.score IS NOT NULL
    WHERE e.student_id = ? AND e.status <> 'withdrawn'${termFilter}
    ORDER BY sem.id DESC, c.code ASC, a.due_date ASC, a.id ASC
  `, params);

  const byOffering = new Map();

  for (const row of rows) {
    const score = Number(row.score);
    const max = Number(row.max_score) || 100;
    const weight = Number(row.weight_percent) || 0;
    const assessmentPercent = max > 0 ? (score / max) * 100 : null;
    const assessmentRule = gradingRuleFor(assessmentPercent, rules);

    let course = byOffering.get(row.offering_id);
    if (!course) {
      course = {
        offering_id: Number(row.offering_id),
        course_code: row.course_code,
        course_title: row.course_title,
        section: row.section,
        room: row.room,
        teacher: (row.teacher || '').trim() || null,
        credit_hours: Number(row.credit_hours) || 0,
        semester_id: Number(row.semester_id),
        semester_name: row.semester_name,
        academic_year: row.academic_year,
        assessments: [],
        score_total: 0,
        max_total: 0,
        weight_total: 0,
        weighted_total: 0,
      };
      byOffering.set(row.offering_id, course);
    }

    course.score_total += score;
    course.max_total += max;
    course.weight_total += weight;
    course.weighted_total += max > 0 ? (score / max) * weight : 0;
    course.assessments.push({
      grade_id: Number(row.grade_id),
      assessment_id: Number(row.assessment_id),
      title: row.assessment_title,
      type: row.assessment_type,
      score,
      max_score: max,
      weight_percent: weight,
      due_date: row.due_date,
      graded_at: row.graded_at,
      percent: assessmentPercent,
      letter_grade: assessmentRule?.letter_grade ?? '—',
    });
  }

  return [...byOffering.values()].map((course) => {
    const percent = course.weight_total > 0
      ? (course.weighted_total / course.weight_total) * 100
      : course.max_total > 0
        ? (course.score_total / course.max_total) * 100
        : null;
    const rule = gradingRuleFor(percent, rules);
    return {
      ...course,
      weighted: course.weight_total > 0,
      percent,
      letter_grade: rule?.letter_grade ?? null,
      grade_point: rule?.grade_point ?? null,
      is_pass: rule ? Boolean(Number(rule.is_pass)) : null,
    };
  });
}

function weightedGpa(courses) {
  const rows = courses.filter((course) => course.percent != null && course.grade_point != null);
  if (!rows.length) return null;
  const credits = rows.reduce((sum, course) => sum + (Number(course.credit_hours) || 0), 0);
  if (!credits) return null;
  const points = rows.reduce((sum, course) => sum + Number(course.grade_point) * (Number(course.credit_hours) || 0), 0);
  return points / credits;
}

async function getStudentAttendance(studentId, offeringId = null) {
  const params = [studentId];
  let filter = '';
  if (offeringId) {
    filter = ' AND s.offering_id = ?';
    params.push(offeringId);
  }

  const [rows] = await pool.query(`
    SELECT ar.status, COUNT(*) AS total
    FROM attendance_records ar
    JOIN attendance_sessions s ON s.id = ar.session_id
    WHERE ar.student_id = ?${filter}
    GROUP BY ar.status
  `, params);

  const counts = { present: 0, late: 0, absent: 0, excused: 0 };
  for (const row of rows) {
    if (row.status in counts) counts[row.status] = Number(row.total);
  }
  const held = counts.present + counts.late + counts.absent;
  const percentage = held > 0 ? ((counts.present + counts.late) / held) * 100 : null;
  return { ...counts, total_sessions: held, percentage };
}

router.get('/student/home', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const { student, currentTerm } = ctx;
    const grading = await loadGradingRules();
    const threshold = await getAttendanceThreshold();

    const allResults = await getStudentCourseResults(student.id, grading.rules);
    const currentResults = currentTerm
      ? allResults.filter((course) => course.semester_id === Number(currentTerm.id))
      : allResults;

    const attendance = await getStudentAttendance(student.id);
    const attendancePercent = attendance.percentage == null ? null : Number(attendance.percentage.toFixed(1));

    const [attendanceByClassRows] = await pool.query(`
      SELECT o.id AS offering_id, c.code AS course_code, c.title AS course_title, o.section,
             SUM(ar.status = 'present') AS present,
             SUM(ar.status = 'late') AS late,
             SUM(ar.status = 'absent') AS absent,
             SUM(ar.status = 'excused') AS excused
      FROM attendance_records ar
      JOIN attendance_sessions s ON s.id = ar.session_id
      JOIN course_offerings o ON o.id = s.offering_id
      JOIN courses c ON c.id = o.course_id
      WHERE ar.student_id = ?
      GROUP BY o.id, c.code, c.title, o.section
      ORDER BY c.code
    `, [student.id]);

    const attendanceByClass = attendanceByClassRows.map((row) => {
      const present = Number(row.present) || 0;
      const late = Number(row.late) || 0;
      const absent = Number(row.absent) || 0;
      const excused = Number(row.excused) || 0;
      const held = present + late + absent;
      const percentage = held > 0 ? Number((((present + late) / held) * 100).toFixed(1)) : null;
      return {
        offering_id: Number(row.offering_id),
        course_code: row.course_code,
        course_title: row.course_title,
        section: row.section,
        present,
        late,
        absent,
        excused,
        total_sessions: held,
        percentage,
        below_threshold: percentage != null && percentage < threshold,
      };
    });

    const [[todayRow]] = await pool.query(
      "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today_date, WEEKDAY(CURDATE()) + 1 AS weekday",
    );

    const [todayRows] = await pool.query(`
      SELECT te.id, te.offering_id, te.weekday, te.starts_at, te.ends_at, te.room,
             te.schedule_status,
             c.code AS course_code, c.title AS course_title,
             o.section, o.room AS offering_room,
             CONCAT(COALESCE(t.first_name, ''), ' ', COALESCE(t.last_name, '')) AS teacher,
             r.room_name
      FROM timetable_entries te
      JOIN course_offerings o ON o.id = te.offering_id
      JOIN courses c ON c.id = o.course_id
      JOIN enrollments e ON e.offering_id = o.id AND e.student_id = ? AND e.status <> 'withdrawn'
      LEFT JOIN teachers t ON t.id = o.teacher_id
      LEFT JOIN rooms r ON r.room_id = te.room_id
      WHERE te.weekday = WEEKDAY(CURDATE()) + 1
        AND te.schedule_status = 'active'
        AND (te.effective_from IS NULL OR te.effective_from <= CURDATE())
        AND (te.effective_until IS NULL OR te.effective_until >= CURDATE())
      ORDER BY te.starts_at ASC
    `, [student.id]);

    const todayClasses = todayRows.map((row) => ({
      id: Number(row.id),
      offering_id: Number(row.offering_id),
      course_code: row.course_code,
      course_title: row.course_title,
      section: row.section,
      teacher: (row.teacher || '').trim() || null,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      room: row.room_name || row.room || row.offering_room || null,
      status: row.schedule_status,
    }));

    const [examRows] = await pool.query(`
      SELECT es.schedule_id,
             DATE_FORMAT(es.exam_date, '%Y-%m-%d') AS exam_date,
             es.starts_at, es.ends_at, es.status,
             a.title AS assessment_title, a.assessment_type, a.max_score,
             c.code AS course_code, c.title AS course_title, o.section,
             r.room_name, o.room AS offering_room
      FROM exam_schedules es
      JOIN assessments a ON a.id = es.assessment_id
      JOIN course_offerings o ON o.id = a.offering_id
      JOIN courses c ON c.id = o.course_id
      JOIN enrollments e ON e.offering_id = o.id AND e.student_id = ? AND e.status <> 'withdrawn'
      LEFT JOIN rooms r ON r.room_id = es.room_id
      WHERE es.status IN ('scheduled', 'postponed')
        AND es.exam_date >= CURDATE()
      ORDER BY es.exam_date ASC, es.starts_at ASC
      LIMIT 5
    `, [student.id]);

    const exams = examRows.map((row) => ({
      id: Number(row.schedule_id),
      assessment_title: row.assessment_title,
      assessment_type: row.assessment_type,
      max_score: Number(row.max_score),
      course_code: row.course_code,
      course_title: row.course_title,
      section: row.section,
      exam_date: row.exam_date,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      room: row.room_name || row.offering_room || null,
      status: row.status,
    }));

    const [announcementRows] = await pool.query(`
      SELECT a.id, a.title, a.body, a.audience, a.published_at,
             a.department_id, a.class_group_id,
             (ar.user_id IS NOT NULL) AS is_read
      FROM announcements a
      LEFT JOIN announcement_reads ar
        ON ar.announcement_id = a.id AND ar.user_id = ?
      WHERE a.status = 'published'
        AND a.published_at IS NOT NULL
        AND a.published_at <= NOW()
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
        AND a.audience IN ('students', 'everyone')
        AND (a.department_id IS NULL OR a.department_id = ?)
        AND (a.class_group_id IS NULL OR a.class_group_id = ?)
      ORDER BY a.published_at DESC
      LIMIT 30
    `, [req.user.sub, student.department_id, student.class_group_id]);

    const announcements = announcementRows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      body: row.body,
      audience: row.audience,
      published_at: row.published_at,
      scope: row.class_group_id ? 'class' : row.department_id ? 'department' : 'college',
      is_read: Boolean(Number(row.is_read)),
    }));

    const latestGrades = allResults
      .flatMap((course) => course.assessments.map((assessment) => ({
        grade_id: assessment.grade_id,
        course_code: course.course_code,
        course_title: course.course_title,
        semester_name: course.semester_name,
        assessment_title: assessment.title,
        score: assessment.score,
        max_score: assessment.max_score,
        percent: assessment.percent,
        letter_grade: assessment.letter_grade,
        graded_at: assessment.graded_at,
      })))
      .sort((a, b) => new Date(b.graded_at ?? 0).getTime() - new Date(a.graded_at ?? 0).getTime())
      .slice(0, 5);

    const levelNumber = Number(student.level_number) || (student.enrollment_year
      ? Math.max(1, new Date().getFullYear() - Number(student.enrollment_year) + 1)
      : null);

    const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ');

    return res.json({
      student: {
        id: Number(student.id),
        student_number: student.student_number,
        first_name: student.first_name,
        middle_name: student.middle_name ?? null,
        last_name: student.last_name,
        full_name: fullName,
        photo_url: student.photo_url ?? null,
        program: student.program_name || student.program_label || 'Not assigned',
        program_code: student.program_code ?? null,
        department: student.department ?? null,
        department_id: student.department_id != null ? Number(student.department_id) : null,
        level_number: levelNumber,
        year_label: levelNumber ? `Level ${levelNumber}` : null,
        qualification_level: student.qualification_level ?? null,
        duration_years: student.duration_years != null ? Number(student.duration_years) : null,
        class_group_id: student.class_group_id != null ? Number(student.class_group_id) : null,
        enrollment_year: student.enrollment_year != null ? Number(student.enrollment_year) : null,
        status: student.status,
        email: student.email ?? null,
        phone: student.phone ?? null,
        date_of_birth: student.date_of_birth ?? null,
        gender: student.gender ?? null,
      },
      term: currentTerm ? {
        id: Number(currentTerm.id),
        name: currentTerm.name,
        academic_year: currentTerm.academic_year,
        starts_on: currentTerm.starts_on,
        ends_on: currentTerm.ends_on,
        is_current: Boolean(Number(currentTerm.is_current)),
      } : null,
      settings: {
        attendance_threshold: threshold,
        grading_scale: grading.scale_name,
        grading_source: grading.source,
        max_gpa: grading.max_gpa,
      },
      totals: {
        courses: currentResults.length,
        unread_announcements: announcements.filter((row) => !row.is_read).length,
        upcoming_exams: exams.length,
        today_classes: todayClasses.length,
      },
      attendance: {
        percentage: attendancePercent,
        present: attendance.present,
        late: attendance.late,
        absent: attendance.absent,
        excused: attendance.excused,
        total_sessions: attendance.total_sessions,
        threshold,
        below_threshold: attendancePercent != null && attendancePercent < threshold,
      },
      gpa: {
        current_term: weightedGpa(currentResults),
        cumulative: weightedGpa(allResults),
        courses_counted: currentResults.filter((course) => course.percent != null).length,
      },
      today: {
        date: todayRow?.today_date ?? null,
        weekday: todayRow?.weekday != null ? Number(todayRow.weekday) : null,
        classes: todayClasses,
      },
      next_exam: exams[0] ?? null,
      announcements: announcements.slice(0, 6),
      latest_grades: latestGrades,
      attendance_by_class: attendanceByClass,
    });
  } catch (error) { next(error); }
});

router.get('/student/profile', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const { student, currentTerm } = ctx;
    const threshold = await getAttendanceThreshold();
    const attendance = await getStudentAttendance(student.id);

    return res.json({
      student: {
        id: Number(student.id),
        student_number: student.student_number,
        first_name: student.first_name,
        middle_name: student.middle_name ?? null,
        last_name: student.last_name,
        photo_url: student.photo_url ?? null,
        program: student.program_name || student.program_label || 'Not assigned',
        program_code: student.program_code ?? null,
        department: student.department ?? null,
        level_number: student.level_number != null ? Number(student.level_number) : null,
        enrollment_year: student.enrollment_year != null ? Number(student.enrollment_year) : null,
        status: student.status,
        email: student.email ?? null,
        phone: student.phone ?? null,
        date_of_birth: student.date_of_birth ?? null,
        gender: student.gender ?? null,
        class_group_id: student.class_group_id != null ? Number(student.class_group_id) : null,
      },
      term: currentTerm ? {
        id: Number(currentTerm.id),
        name: currentTerm.name,
        academic_year: currentTerm.academic_year,
        is_current: Boolean(Number(currentTerm.is_current)),
      } : null,
      attendance_threshold: threshold,
      attendance_percentage: attendance.percentage == null ? null : Number(attendance.percentage.toFixed(1)),
      editable_fields: ['phone', 'email', 'password'],
    });
  } catch (error) { next(error); }
});

router.put('/student/profile', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const body = req.body ?? {};
    const allowed = ['phone', 'email'];
    const unexpected = Object.keys(body).filter((key) => !allowed.includes(key));
    if (unexpected.length) {
      return res.status(400).json({ message: `Only phone and email can be edited here (received: ${unexpected.join(', ')}).` });
    }

    const updates = {};
    for (const field of allowed) {
      if (body[field] === undefined) continue;
      const value = body[field] === null ? null : String(body[field]).trim();
      if (value && value.length > 190) {
        return res.status(400).json({ message: `${field} is too long.` });
      }
      updates[field] = value || null;
    }

    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'Send a phone or email value to update.' });
    }

    const fields = Object.keys(updates);
    await pool.execute(
      `UPDATE students SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`,
      [...fields.map((field) => updates[field]), ctx.student.id],
    );

    await writeAuditLog({
      actorUserId: req.user.sub,
      userId: req.user.sub,
      action: 'student_profile_updated',
      entityType: 'student',
      entityId: ctx.student.id,
      details: {
        fields,
        old: Object.fromEntries(fields.map((field) => [field, ctx.student[field] ?? null])),
        new: updates,
      },
      request: req,
    });

    return res.json({ updated: true, student: updates });
  } catch (error) { next(error); }
});

router.put('/student/profile/password', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, req.user.sub]);

    await writeAuditLog({
      actorUserId: req.user.sub,
      userId: req.user.sub,
      action: 'password_changed',
      entityType: 'user',
      entityId: req.user.sub,
      details: { changed_by: 'student_self_service' },
      request: req,
    });

    return res.json({ changed: true });
  } catch (error) { next(error); }
});

router.post('/student/announcements/:id/read', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const announcementId = Number(req.params.id);
    if (!Number.isFinite(announcementId) || announcementId <= 0) {
      return res.status(400).json({ message: 'Invalid announcement id.' });
    }

    const [visible] = await pool.query(`
      SELECT a.id FROM announcements a
      WHERE a.id = ?
        AND a.status = 'published'
        AND a.published_at IS NOT NULL
        AND a.published_at <= NOW()
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
        AND a.audience IN ('students', 'everyone')
        AND (a.department_id IS NULL OR a.department_id = ?)
        AND (a.class_group_id IS NULL OR a.class_group_id = ?)
      LIMIT 1
    `, [announcementId, ctx.student.department_id, ctx.student.class_group_id]);

    if (!visible[0]) return res.status(404).json({ message: 'Announcement not found.' });

    await pool.execute(`
      INSERT INTO announcement_reads (announcement_id, user_id, read_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE read_at = read_at
    `, [announcementId, req.user.sub]);

    return res.json({ read: true });
  } catch (error) { next(error); }
});

/* ---------- My courses ---------- */

router.get('/student/courses', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const semesterId = req.query.semester_id ? Number(req.query.semester_id) : null;
    const params = [ctx.student.id];
    let termFilter = '';
    if (semesterId) {
      termFilter = ' AND o.semester_id = ?';
      params.push(semesterId);
    }

    const [rows] = await pool.query(`
      SELECT o.id AS offering_id, o.section, o.room, o.status AS offering_status,
             c.id AS course_id, c.code AS course_code, c.title AS course_title, c.credit_hours,
             sem.id AS semester_id, sem.name AS semester_name, ay.name AS academic_year,
             CONCAT(COALESCE(t.first_name, ''), ' ', COALESCE(t.last_name, '')) AS teacher
      FROM enrollments e
      JOIN course_offerings o ON o.id = e.offering_id
      JOIN courses c ON c.id = o.course_id
      JOIN semesters sem ON sem.id = o.semester_id
      JOIN academic_years ay ON ay.id = sem.academic_year_id
      LEFT JOIN teachers t ON t.id = o.teacher_id
      WHERE e.student_id = ? AND e.status <> 'withdrawn'${termFilter}
      ORDER BY sem.id DESC, c.code ASC
    `, params);

    const courses = rows.map((row) => ({
      offering_id: Number(row.offering_id),
      course_id: Number(row.course_id),
      course_code: row.course_code,
      course_title: row.course_title,
      section: row.section,
      room: row.room || null,
      teacher: (row.teacher || '').trim() || null,
      credit_hours: Number(row.credit_hours) || 0,
      semester_id: Number(row.semester_id),
      semester_name: row.semester_name,
      academic_year: row.academic_year,
      status: row.offering_status,
    }));

    return res.json({ courses, term: ctx.currentTerm ? { id: Number(ctx.currentTerm.id), name: ctx.currentTerm.name, academic_year: ctx.currentTerm.academic_year } : null });
  } catch (error) { next(error); }
});

router.get('/student/courses/:offeringId', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const offeringId = Number(req.params.offeringId);
    if (!Number.isFinite(offeringId) || offeringId <= 0) {
      return res.status(400).json({ message: 'Invalid offering id.' });
    }

    // Verify the student is enrolled in this offering.
    const [enrollment] = await pool.query(`
      SELECT e.id, e.status, o.section, o.room, o.status AS offering_status,
             c.id AS course_id, c.code AS course_code, c.title AS course_title, c.credit_hours,
             sem.id AS semester_id, sem.name AS semester_name, ay.name AS academic_year,
             CONCAT(COALESCE(t.first_name, ''), ' ', COALESCE(t.last_name, '')) AS teacher
      FROM enrollments e
      JOIN course_offerings o ON o.id = e.offering_id
      JOIN courses c ON c.id = o.course_id
      JOIN semesters sem ON sem.id = o.semester_id
      JOIN academic_years ay ON ay.id = sem.academic_year_id
      LEFT JOIN teachers t ON t.id = o.teacher_id
      WHERE e.student_id = ? AND o.id = ? AND e.status <> 'withdrawn'
      LIMIT 1
    `, [ctx.student.id, offeringId]);

    if (!enrollment[0]) return res.status(404).json({ message: 'You are not enrolled in this course.' });

    const course = {
      offering_id: offeringId,
      course_id: Number(enrollment[0].course_id),
      course_code: enrollment[0].course_code,
      course_title: enrollment[0].course_title,
      section: enrollment[0].section,
      room: enrollment[0].room || null,
      teacher: (enrollment[0].teacher || '').trim() || null,
      credit_hours: Number(enrollment[0].credit_hours) || 0,
      semester_id: Number(enrollment[0].semester_id),
      semester_name: enrollment[0].semester_name,
      academic_year: enrollment[0].academic_year,
      status: enrollment[0].offering_status,
      enrollment_status: enrollment[0].status,
    };

    // Timetable for this offering.
    const [timetableRows] = await pool.query(`
      SELECT te.id, te.weekday, te.starts_at, te.ends_at, te.room, te.schedule_status
      FROM timetable_entries te
      WHERE te.offering_id = ? AND te.schedule_status = 'active'
      ORDER BY te.weekday, te.starts_at
    `, [offeringId]);

    const timetable = timetableRows.map((row) => ({
      id: Number(row.id),
      weekday: Number(row.weekday),
      weekday_label: weekdayLabel(Number(row.weekday)),
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      room: row.room || null,
      status: row.schedule_status,
    }));

    // Grades for this course (published only).
    const grading = await loadGradingRules();
    const results = await getStudentCourseResults(ctx.student.id, grading.rules, { semesterId: course.semester_id });
    const courseResult = results.find((r) => r.offering_id === offeringId) ?? null;

    return res.json({ course, timetable, grades: courseResult ? courseResult.assessments : [], summary: courseResult ? {
      percent: courseResult.percent,
      letter_grade: courseResult.letter_grade,
      grade_point: courseResult.grade_point,
      weighted: courseResult.weighted,
      assessments_count: courseResult.assessments.length,
    } : null });
  } catch (error) { next(error); }
});

/* ---------- Grades ---------- */

router.get('/student/grades', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const semesterId = req.query.semester_id ? Number(req.query.semester_id) : null;
    const grading = await loadGradingRules();
    const results = await getStudentCourseResults(ctx.student.id, grading.rules, { semesterId });

    const courses = results.map((course) => ({
      offering_id: course.offering_id,
      course_code: course.course_code,
      course_title: course.course_title,
      section: course.section,
      teacher: course.teacher,
      credit_hours: course.credit_hours,
      semester_id: course.semester_id,
      semester_name: course.semester_name,
      academic_year: course.academic_year,
      weighted: course.weighted,
      percent: course.percent,
      letter_grade: course.letter_grade,
      grade_point: course.grade_point,
      is_pass: course.is_pass,
      assessments: course.assessments.map((a) => ({
        grade_id: a.grade_id,
        assessment_id: a.assessment_id,
        title: a.title,
        type: a.type,
        score: a.score,
        max_score: a.max_score,
        weight_percent: a.weight_percent,
        percent: a.percent,
        letter_grade: a.letter_grade,
        due_date: a.due_date,
        graded_at: a.graded_at,
      })),
    }));

    return res.json({ courses, grading: { scale_name: grading.scale_name, source: grading.source, max_gpa: grading.max_gpa }, term: ctx.currentTerm ? { id: Number(ctx.currentTerm.id), name: ctx.currentTerm.name, academic_year: ctx.currentTerm.academic_year } : null });
  } catch (error) { next(error); }
});

/* ---------- Attendance ---------- */

router.get('/student/attendance', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const threshold = await getAttendanceThreshold();
    const overall = await getStudentAttendance(ctx.student.id);

    const [byClassRows] = await pool.query(`
      SELECT o.id AS offering_id, c.code AS course_code, c.title AS course_title, o.section,
             SUM(ar.status = 'present') AS present,
             SUM(ar.status = 'late') AS late,
             SUM(ar.status = 'absent') AS absent,
             SUM(ar.status = 'excused') AS excused
      FROM attendance_records ar
      JOIN attendance_sessions s ON s.id = ar.session_id
      JOIN course_offerings o ON o.id = s.offering_id
      JOIN courses c ON c.id = o.course_id
      WHERE ar.student_id = ?
      GROUP BY o.id, c.code, c.title, o.section
      ORDER BY c.code
    `, [ctx.student.id]);

    const byClass = byClassRows.map((row) => {
      const present = Number(row.present) || 0;
      const late = Number(row.late) || 0;
      const absent = Number(row.absent) || 0;
      const excused = Number(row.excused) || 0;
      const held = present + late + absent;
      const percentage = held > 0 ? Number((((present + late) / held) * 100).toFixed(1)) : null;
      return {
        offering_id: Number(row.offering_id),
        course_code: row.course_code,
        course_title: row.course_title,
        section: row.section,
        present,
        late,
        absent,
        excused,
        total_sessions: held,
        percentage,
        below_threshold: percentage != null && percentage < threshold,
      };
    });

    // Recent sessions (calendar/list of absences), most recent first.
    const [sessionsRows] = await pool.query(`
      SELECT ar.status, ar.marked_at,
             s.session_date, s.topic,
             c.code AS course_code, c.title AS course_title, o.section
      FROM attendance_records ar
      JOIN attendance_sessions s ON s.id = ar.session_id
      JOIN course_offerings o ON o.id = s.offering_id
      JOIN courses c ON c.id = o.course_id
      WHERE ar.student_id = ?
      ORDER BY s.session_date DESC, s.id DESC
      LIMIT 40
    `, [ctx.student.id]);

    const sessions = sessionsRows.map((row) => ({
      course_code: row.course_code,
      course_title: row.course_title,
      section: row.section,
      session_date: row.session_date,
      topic: row.topic || null,
      status: row.status,
      recorded_at: row.marked_at,
    }));

    const overallPercent = overall.percentage == null ? null : Number(overall.percentage.toFixed(1));

    return res.json({
      threshold,
      overall: {
        present: overall.present,
        late: overall.late,
        absent: overall.absent,
        excused: overall.excused,
        total_sessions: overall.total_sessions,
        percentage: overallPercent,
        below_threshold: overallPercent != null && overallPercent < threshold,
      },
      by_class: byClass,
      sessions,
    });
  } catch (error) { next(error); }
});

/* ---------- Timetable ---------- */

function weekdayLabel(weekday) {
  if (!weekday) return '';
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][weekday - 1] ?? '';
}

router.get('/student/timetable', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const [rows] = await pool.query(`
      SELECT te.id, te.offering_id, te.weekday, te.starts_at, te.ends_at, te.room, te.schedule_status,
             c.code AS course_code, c.title AS course_title, o.section,
             CONCAT(COALESCE(t.first_name, ''), ' ', COALESCE(t.last_name, '')) AS teacher
      FROM timetable_entries te
      JOIN course_offerings o ON o.id = te.offering_id
      JOIN courses c ON c.id = o.course_id
      JOIN enrollments e ON e.offering_id = o.id AND e.student_id = ? AND e.status <> 'withdrawn'
      LEFT JOIN teachers t ON t.id = o.teacher_id
      WHERE te.schedule_status = 'active'
      ORDER BY te.weekday, te.starts_at
    `, [ctx.student.id]);

    const entries = rows.map((row) => ({
      id: Number(row.id),
      offering_id: Number(row.offering_id),
      course_code: row.course_code,
      course_title: row.course_title,
      section: row.section,
      teacher: (row.teacher || '').trim() || null,
      weekday: Number(row.weekday),
      weekday_label: weekdayLabel(Number(row.weekday)),
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      room: row.room || null,
      status: row.schedule_status,
    }));

    return res.json({ entries, weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] });
  } catch (error) { next(error); }
});

/* ---------- Exams ---------- */

router.get('/student/exams', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const [rows] = await pool.query(`
      SELECT es.schedule_id,
             DATE_FORMAT(es.exam_date, '%Y-%m-%d') AS exam_date,
             es.starts_at, es.ends_at, es.status,
             a.title AS assessment_title, a.assessment_type, a.max_score,
             c.code AS course_code, c.title AS course_title, o.section,
             r.room_name, o.room AS offering_room
      FROM exam_schedules es
      JOIN assessments a ON a.id = es.assessment_id
      JOIN course_offerings o ON o.id = a.offering_id
      JOIN courses c ON c.id = o.course_id
      JOIN enrollments e ON e.offering_id = o.id AND e.student_id = ? AND e.status <> 'withdrawn'
      LEFT JOIN rooms r ON r.room_id = es.room_id
      WHERE es.status IN ('scheduled', 'postponed')
        AND es.exam_date >= CURDATE()
      ORDER BY es.exam_date ASC, es.starts_at ASC
    `, [ctx.student.id]);

    const exams = rows.map((row) => ({
      id: Number(row.schedule_id),
      assessment_title: row.assessment_title,
      assessment_type: row.assessment_type,
      max_score: Number(row.max_score),
      course_code: row.course_code,
      course_title: row.course_title,
      section: row.section,
      exam_date: row.exam_date,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      room: row.room_name || row.offering_room || null,
      status: row.status,
    }));

    return res.json({ exams, upcoming: exams.filter((e) => e.status === 'scheduled') });
  } catch (error) { next(error); }
});

/* ---------- Announcements ---------- */

router.get('/student/announcements', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    const [rows] = await pool.query(`
      SELECT a.id, a.title, a.body, a.audience, a.published_at,
             a.department_id, a.class_group_id,
             (ar.user_id IS NOT NULL) AS is_read
      FROM announcements a
      LEFT JOIN announcement_reads ar
        ON ar.announcement_id = a.id AND ar.user_id = ?
      WHERE a.status = 'published'
        AND a.published_at IS NOT NULL
        AND a.published_at <= NOW()
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
        AND a.audience IN ('students', 'everyone')
        AND (a.department_id IS NULL OR a.department_id = ?)
        AND (a.class_group_id IS NULL OR a.class_group_id = ?)
      ORDER BY a.published_at DESC
    `, [req.user.sub, ctx.student.department_id, ctx.student.class_group_id]);

    const announcements = rows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      body: row.body,
      audience: row.audience,
      published_at: row.published_at,
      scope: row.class_group_id ? 'class' : row.department_id ? 'department' : 'college',
      is_read: Boolean(Number(row.is_read)),
    }));

    return res.json({
      announcements,
      unread_count: announcements.filter((a) => !a.is_read).length,
    });
  } catch (error) { next(error); }
});

/* ---------- Transcript (published terms only) ---------- */

router.get('/student/transcript', authenticate, allowRoles('student'), async (req, res, next) => {
  try {
    const ctx = await getStudentContext(req.user.sub);
    if (!ctx) return res.status(404).json({ message: 'Student record not found for this account.' });

    // Terms that have been published (results_published_at set), most recent first.
    const [terms] = await pool.query(`
      SELECT sem.id, sem.name, sem.starts_on, sem.ends_on, sem.is_current,
             ay.name AS academic_year, sem.results_published_at
      FROM semesters sem
      JOIN academic_years ay ON ay.id = sem.academic_year_id
      WHERE sem.results_published_at IS NOT NULL
      ORDER BY sem.starts_on DESC, sem.id DESC
    `);

    const grading = await loadGradingRules();

    const transcriptTerms = [];
    let cumulativeCredits = 0;
    let cumulativePoints = 0;

    for (const term of terms) {
      const results = await getStudentCourseResults(ctx.student.id, grading.rules, { semesterId: Number(term.id) });
      const termCourses = results.map((course) => ({
        course_code: course.course_code,
        course_title: course.course_title,
        section: course.section,
        credit_hours: course.credit_hours,
        percent: course.percent,
        letter_grade: course.letter_grade,
        grade_point: course.grade_point,
        is_pass: course.is_pass,
        assessments: course.assessments.map((a) => ({
          title: a.title,
          type: a.type,
          score: a.score,
          max_score: a.max_score,
          weight_percent: a.weight_percent,
          percent: a.percent,
          letter_grade: a.letter_grade,
          graded_at: a.graded_at,
        })),
      }));

      const termGpa = weightedGpa(results);
      const termCredits = results.reduce((sum, c) => sum + (Number(c.credit_hours) || 0), 0);
      const counted = results.filter((c) => c.percent != null && c.grade_point != null);
      const termPoints = counted.reduce((sum, c) => sum + Number(c.grade_point) * (Number(c.credit_hours) || 0), 0);

      cumulativeCredits += termCredits;
      cumulativePoints += termPoints;

      transcriptTerms.push({
        id: Number(term.id),
        name: term.name,
        academic_year: term.academic_year,
        starts_on: term.starts_on,
        ends_on: term.ends_on,
        is_current: Boolean(Number(term.is_current)),
        published_at: term.results_published_at,
        gpa: termGpa,
        courses: termCourses,
      });
    }

    const cumulativeGpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : null;

    return res.json({
      student: {
        id: Number(ctx.student.id),
        student_number: ctx.student.student_number,
        first_name: ctx.student.first_name,
        last_name: ctx.student.last_name,
        program: ctx.student.program_name || ctx.student.program_label || 'Not assigned',
        department: ctx.student.department || null,
      },
      terms: transcriptTerms,
      cumulative_gpa: cumulativeGpa,
      cumulative_credits: cumulativeCredits,
    });
  } catch (error) { next(error); }
});

export default router;

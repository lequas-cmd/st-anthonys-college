export type AdminStudent = {
  student_number: string;
  first_name: string;
  last_name: string;
  program: string | null;
  enrollment_year: number | null;
  status?: string | null;
};

export type AdminDashboardResponse = {
  totals: { students: number; teachers: number; users: number };
  students: AdminStudent[];
};

export type AdminTab = "overview" | "students" | "faculty" | "academics" | "attendance" | "exams" | "documents" | "usersroles" | "programs" | "reports" | "announcements" | "settings";

export const levelFromEnrollmentYear = (year: number | null) => {
  if (!year) return "Level N/A";
  const academicLevel = Math.max(1, new Date().getFullYear() - Number(year) + 1);
  return `Level ${academicLevel}`;
};

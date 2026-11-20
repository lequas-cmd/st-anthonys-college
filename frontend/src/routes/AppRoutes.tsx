import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout, PageIntro } from '../components/ui';
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Programs from '../pages/public/Programs';
import ProgramDetail from '../pages/public/ProgramDetail';
import Admissions from '../pages/public/Admissions';
import HowToApply from '../pages/public/HowToApply';
import StudentLife from '../pages/public/StudentLife';
import Announcements from '../pages/public/Announcements';
import NewsEvents from '../pages/public/NewsEvents';
import Resources from '../pages/public/Resources';
import Contact from '../pages/public/Contact';
import SearchPage from '../pages/public/Search';
import Portal from '../pages/public/Portal';
import NewsDetail from '../pages/public/NewsDetail';
import StudentDashboard from '../pages/dashboard/student/StudentDashboard';
import TeacherDashboard from '../pages/dashboard/teacher/TeacherDashboard';
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import { getLocaleFromPathname, getLocaleAwarePath } from '../i18n/locale';
import { messages } from '../i18n/messages';

function SimpleInfo({ title, pending = false }: { title?: string; pending?: boolean }) {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].notFound;

  return (
    <Layout>
      <main>
        <PageIntro eyebrow="College information" title={title || copy.title} description={pending ? copy.pending : copy.description} />
        <section className="section wrap article-body">
          <p>{pending ? copy.pending : copy.description}</p>
        </section>
      </main>
    </Layout>
  );
}

const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/programs', element: <Programs /> },
  { path: '/programs/:slug', element: <ProgramDetail /> },
  { path: '/admissions', element: <Admissions /> },
  { path: '/how-to-apply', element: <HowToApply /> },
  { path: '/portal', element: <Portal /> },
  { path: '/login', element: <Portal /> },
  { path: '/student-life', element: <StudentLife /> },
  { path: '/announcements', element: <Announcements /> },
  { path: '/news-events', element: <NewsEvents /> },
  { path: '/news-events/:slug', element: <NewsDetail /> },
  { path: '/resources', element: <Resources /> },
  { path: '/contact', element: <Contact /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/privacy', element: <SimpleInfo title="Privacy policy" pending /> },
  { path: '/accessibility', element: <SimpleInfo title="Accessibility" pending /> },
  { path: '*', element: <SimpleInfo /> },
];

export default function App() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <Routes>
      {publicRoutes.flatMap((route) => {
        const englishPath = route.path === '*' ? '*' : route.path;
        const amPath = route.path === '*' ? '/am/*' : getLocaleAwarePath(route.path, 'am');

        return [
          <Route key={`${route.path}-en`} path={englishPath} element={route.element} />,
          ...(route.path === '*' ? [] : [<Route key={`${route.path}-am`} path={amPath} element={route.element} />]),
        ];
      })}

      <Route path="/dashboard/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/teacher/:section/:classId?" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

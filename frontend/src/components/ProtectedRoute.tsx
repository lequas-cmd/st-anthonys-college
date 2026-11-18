import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type Role = 'student' | 'teacher' | 'admin';

type Props = { role: Role; children: React.ReactNode };

type StoredUser = { role?: Role };

export default function ProtectedRoute({ role, children }: Props) {
  const location = useLocation();
  const token = localStorage.getItem('collegeAuthToken') ?? sessionStorage.getItem('collegeSessionToken');
  const storedUser = localStorage.getItem('collegeUser') ?? sessionStorage.getItem('collegeUser');

  if (!token || !storedUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  try {
    const user = JSON.parse(storedUser) as StoredUser;
    if (user.role !== role) {
      const ownRoute = user.role === 'student' ? '/dashboard/student' : user.role === 'teacher' ? '/dashboard/teacher' : user.role === 'admin' ? '/dashboard/admin' : '/login';
      return <Navigate to={ownRoute} replace />;
    }
  } catch {
    localStorage.removeItem('collegeAuthToken');
    localStorage.removeItem('collegeUser');
    sessionStorage.removeItem('collegeSessionToken');
    sessionStorage.removeItem('collegeUser');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

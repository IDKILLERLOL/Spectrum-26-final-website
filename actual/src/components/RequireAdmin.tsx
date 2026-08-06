import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

/** Wraps admin dashboard routes. Redirects to /admin gate if not admin-authenticated. */
export function RequireAdmin() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'var(--color-bg-base)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
             style={{ borderColor: 'var(--color-text-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

/** Wraps admin dashboard routes. Redirects to /admin gate if not admin-authenticated. */
export function RequireAdmin() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className=""
           style={{ background: 'var(--color-bg-base)' }}>
        <div className=""
             style={{ borderColor: 'var(--color-text-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/supercore" replace />;
  }

  return <Outlet />;
}

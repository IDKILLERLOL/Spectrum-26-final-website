import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, User, LogOut, LogIn, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { useCallback, useState, useEffect } from 'react';
import { getTheme, toggleTheme as triggerToggleTheme } from '../lib/theme';
import { getMyRegistrations, getUser } from '../lib/firestore';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [theme, setTheme] = useState(getTheme);
  const [hasRegistrations, setHasRegistrations] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [dbUser, setDbUser] = useState<any | null>(null);

  // Fetch participant profile from Firestore or fallback to local user data
  useEffect(() => {
    if (!user) {
      setDbUser(null);
      return;
    }
    getUser(user.uid)
      .then((profile) => {
        if (profile) {
          setDbUser(profile);
        } else {
          setDbUser({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || 'No email',
          });
        }
      })
      .catch(() => {
        setDbUser({
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || 'No email',
        });
      });
  }, [user]);

  // Check if the logged-in user has any registrations (controls My Passes visibility)
  useEffect(() => {
    if (!user) {
      setHasRegistrations(false);
      return;
    }
    getMyRegistrations(user.uid, user.email ?? undefined)
      .then((regs) => setHasRegistrations(regs.length > 0))
      .catch(() => setHasRegistrations(false));
  }, [user, location.pathname]);

  const handleToggleTheme = useCallback(() => {
    triggerToggleTheme(theme, (nextTheme) => {
      setTheme(nextTheme);
    });
  }, [theme]);

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className="font-heading text-heading transition-all duration-150"
      style={{
        color: location.pathname === to
          ? 'var(--color-text-primary)'
          : 'var(--color-text-muted)',
        borderBottom: location.pathname === to
          ? '2px solid var(--color-text-primary)'
          : '2px solid transparent',
        paddingBottom: '2px',
        fontWeight: location.pathname === to ? 700 : 500,
      }}
    >
      {label}
    </Link>
  );

  return (
    <header
      className="w-full top-0 sticky z-50 transition-colors duration-200 border-b"
      style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-default)' }}
    >
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
        {/* Wordmark */}
        <Link
          to="/"
          className="font-hero text-card-title tracking-widest uppercase hover:scale-[1.02] transition-transform duration-150"
          style={{ color: 'var(--color-text-primary)' }}
        >
          SPECTRUM 26
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLink('/', 'Events')}
          {navLink('/schedule', 'Schedule')}
          {navLink('/winners', 'Winners')}
          {user && navLink('/my-registrations', 'My Passes')}
        </nav>

        {/* Right controls */}
        <div className="flex gap-4 items-center">
          {/* Theme toggle */}
          <button
            onClick={handleToggleTheme}
            aria-label="Toggle theme"
            className="transition-transform duration-150 hover:scale-110 active:scale-95"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {theme === 'light'
              ? <Moon size={22} />
              : <Sun size={22} />}
          </button>

          {!loading && (
            user ? (
               <div className="flex items-center gap-3 relative">
                <button
                  onClick={() => setShowUserCard(!showUserCard)}
                  className="flex items-center gap-2 text-heading font-heading hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <User size={18} />
                  <span className="max-w-[120px] truncate">{dbUser?.name || user.displayName || user.email?.split('@')[0] || 'User'}</span>
                </button>

                {showUserCard && (
                  <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowUserCard(false)} />
                    <div
                      className="absolute right-0 top-full mt-2 p-5 border shadow-2xl flex flex-col gap-3 min-w-[260px] z-50 text-left animate-fade-in"
                      style={{
                        background: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border-default)',
                        borderRadius: '8px',
                      }}
                    >
                      <h4 className="font-heading text-micro uppercase tracking-wider border-b border-border-default pb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Your Account Details
                      </h4>
                      <div className="flex flex-col gap-2 font-body text-small">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Name</span>
                          <span style={{ color: 'var(--color-text-primary)' }}>{dbUser?.name || user.displayName || user.email?.split('@')[0] || 'User'}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Email</span>
                          <span className="font-mono text-[13px]" style={{ color: 'var(--color-text-primary)' }}>{dbUser?.email || user.email || 'No Email'}</span>
                        </div>
                        {dbUser?.phone && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Phone</span>
                            <span style={{ color: 'var(--color-text-primary)' }}>{dbUser.phone}</span>
                          </div>
                        )}
                        {dbUser?.college && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>College</span>
                            <span style={{ color: 'var(--color-text-primary)' }}>{dbUser.college}</span>
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>User ID</span>
                          <span className="font-mono text-[10px] break-all select-all" style={{ color: 'var(--color-text-secondary)' }}>{user.uid}</span>
                        </div>

                        <button
                          onClick={() => {
                            setShowUserCard(false);
                            logout();
                          }}
                          className="mt-3 w-full py-2.5 font-button text-micro uppercase tracking-wider flex items-center justify-center gap-2 transition-colors hover:opacity-85"
                          style={{
                            background: 'var(--color-text-primary)',
                            color: 'var(--color-bg-base)',
                            borderRadius: '4px',
                          }}
                        >
                          <LogOut size={12} /> Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 font-button text-button px-4 py-2 transition-all duration-150 hover:scale-[1.02]"
                style={{
                  background: 'var(--color-text-primary)',
                  color: 'var(--color-bg-base)',
                  borderRadius: '6px',
                }}
              >
                <LogIn size={16} />
                <span className="hidden md:block">Login</span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className="flex md:hidden gap-6 px-6 py-3 border-t overflow-x-auto"
        style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-default)' }}
      >
        {[
          { to: '/', label: 'Events' },
          { to: '/schedule', label: 'Schedule' },
          { to: '/winners', label: 'Winners' },
          ...(user ? [{ to: '/my-registrations', label: 'My Passes' }] : []),
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="font-heading text-small whitespace-nowrap transition-colors duration-150"
            style={{
              color: location.pathname === to
                ? 'var(--color-text-primary)'
                : 'var(--color-text-secondary)',
              fontWeight: location.pathname === to ? 700 : 400,
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { useCallback, useState, useEffect } from 'react';
import { getTheme, toggleTheme as triggerToggleTheme } from '../lib/theme';
import { getMyRegistrations, getUser } from '../lib/firestore';
import { playSynthSound, setSoundEnabled } from '../lib/audio';
import { Volume2, VolumeX, Sun, Moon, LogIn, LogOut, User } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const [theme, setTheme] = useState(getTheme);
  const [hasRegistrations, setHasRegistrations] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [sfxOn, setSfxOn] = useState(true);

  useEffect(() => {
    if (!user) { setDbUser(null); return; }
    getUser(user.uid)
      .then((profile) => setDbUser(profile ?? { name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' }))
      .catch(() => setDbUser({ name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' }));
  }, [user]);

  useEffect(() => {
    if (!user) { setHasRegistrations(false); return; }
    getMyRegistrations(user.uid, user.email ?? undefined)
      .then((regs) => setHasRegistrations(regs.length > 0))
      .catch(() => setHasRegistrations(false));
  }, [user, location.pathname]);

  const handleToggleTheme = useCallback(() => {
    playSynthSound('zap');
    triggerToggleTheme(theme, (next) => setTheme(next));
  }, [theme]);

  const toggleSfx = () => {
    const next = !sfxOn;
    setSfxOn(next);
    setSoundEnabled(next);
    if (next) playSynthSound('click');
  };

  const isActive = (to: string) => location.pathname === to;

  const navLink = (to: string, label: string) => (
    <Link
      key={to}
      to={to}
      onClick={() => playSynthSound('click')}
      style={{
        fontFamily: 'Bangers, cursive',
        fontSize: '20px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: 'var(--color-text-primary)',
        textDecoration: isActive(to) ? 'underline' : 'none',
        textDecorationStyle: isActive(to) ? 'solid' : undefined,
        textDecorationThickness: isActive(to) ? '3px' : undefined,
        textUnderlineOffset: '4px',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline';
        (e.currentTarget as HTMLAnchorElement).style.textDecorationStyle = 'solid';
        (e.currentTarget as HTMLAnchorElement).style.textDecorationThickness = '3px';
      }}
      onMouseLeave={(e) => {
        if (!isActive(to)) {
          (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none';
        }
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav
      className="relative z-50 mx-auto max-w-7xl w-[92%] mt-6 p-4 comic-shadow flex flex-wrap justify-between items-center gap-4"
      style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          onClick={() => playSynthSound('click')}
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(24px, 4vw, 36px)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-12deg)',
            display: 'inline-block',
            fontStyle: 'italic',
            textDecoration: 'none',
            userSelect: 'none',
          }}
        >
          SPECTRUM 26
        </Link>
      </div>

      {/* Right side: nav links + controls */}
      <div className="flex items-center gap-6 flex-wrap">
        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 items-center">
          {navLink('/', 'Events')}
          {navLink('/schedule', 'Schedule')}
          {navLink('/winners', 'Winners')}
          {navLink('/gallery', 'Gallery')}
          {user && hasRegistrations && navLink('/my-registrations', 'My Passes')}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* SFX Toggle */}
          <button
            onClick={toggleSfx}
            style={{
              border: '2px solid var(--border-color)',
              borderRadius: '4px',
              padding: '4px 10px',
              background: 'var(--badge-bg)',
              color: 'var(--color-text-primary)',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '1.5px 1.5px 0px var(--border-color)',
              letterSpacing: '0.04em',
            }}
          >
            {sfxOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            SFX: {sfxOn ? 'ON' : 'OFF'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={handleToggleTheme}
            className="comic-shadow-sm"
            style={{
              background: 'var(--panel-bg)',
              color: 'var(--color-text-primary)',
              fontFamily: 'Bangers, cursive',
              fontSize: '18px',
              padding: '6px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            SWAP
          </button>


        </div>
      </div>

      {/* Mobile nav row */}
      <div
        className="flex md:hidden gap-4 w-full overflow-x-auto pt-3"
        style={{ borderTop: '2px solid var(--border-color)' }}
      >
        {[
          { to: '/', label: 'Events' },
          { to: '/schedule', label: 'Schedule' },
          { to: '/winners', label: 'Winners' },
          { to: '/gallery', label: 'Gallery' },
          ...(user ? [{ to: '/my-registrations', label: 'My Passes' }] : []),
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            onClick={() => playSynthSound('click')}
            style={{
              fontFamily: 'Bangers, cursive',
              fontSize: '18px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
              textDecoration: isActive(to) ? 'underline' : 'none',
              textDecorationStyle: isActive(to) ? 'solid' : undefined,
              textDecorationThickness: isActive(to) ? '3px' : undefined,
              textUnderlineOffset: '3px',
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

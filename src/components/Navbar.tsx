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
        textDecorationStyle: isActive(to) ? 'wavy' : undefined,
        textUnderlineOffset: '4px',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline';
        (e.currentTarget as HTMLAnchorElement).style.textDecorationStyle = 'wavy';
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
      className="relative z-10 mx-auto max-w-7xl w-[92%] mt-6 p-4 comic-shadow flex flex-wrap justify-between items-center gap-4"
      style={{ background: '#000000', borderColor: 'var(--border-color)' }}
    >
      {/* Wordmark + badge */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          onClick={() => playSynthSound('click')}
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(24px, 4vw, 36px)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#ffffff',
            transform: 'skewX(-12deg)',
            display: 'inline-block',
            fontStyle: 'italic',
            textDecoration: 'none',
            userSelect: 'none',
          }}
        >
          SPECTRUM 26
        </Link>
        <span
          className="comic-badge px-3 py-1 font-comic"
          style={{
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            fontStyle: 'italic',
          }}
        >
          CRISIS 001
        </span>
      </div>

      {/* Right side: nav links + controls */}
      <div className="flex items-center gap-6 flex-wrap">
        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 items-center">
          {navLink('/', 'Events')}
          {navLink('/schedule', 'Schedule')}
          {navLink('/winners', 'Winners')}
          {user && hasRegistrations && navLink('/my-registrations', 'My Panels')}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* SFX Toggle */}
          <button
            onClick={toggleSfx}
            style={{
              border: '2px solid #ffffff',
              borderRadius: '4px',
              padding: '4px 10px',
              background: '#1a1a1a',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '1.5px 1.5px 0px #ffffff',
              letterSpacing: '0.04em',
            }}
          >
            {sfxOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            SFX: {sfxOn ? 'ON' : 'OFF'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={handleToggleTheme}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: '3px solid #ffffff',
              boxShadow: '4px 4px 0px rgba(255, 255, 255, 0.15)',
              fontFamily: 'Bangers, cursive',
              fontSize: '18px',
              padding: '6px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px, -2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px 0px rgba(255, 255, 255, 0.15)';
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            SWAP
          </button>

          {/* Auth */}
          {!loading && (
            user ? (
              <div className="relative">
                <button
                  onClick={() => { playSynthSound('click'); setShowUserCard(!showUserCard); }}
                  className="comic-btn-outline"
                  style={{ fontSize: '14px', padding: '6px 14px', borderColor: '#ffffff', color: '#ffffff' }}
                >
                  <User size={13} className="mr-1 inline" />
                  {dbUser?.name || user.displayName || user.email?.split('@')[0] || 'AGENT'}
                </button>

                {showUserCard && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserCard(false)} />
                    <div
                      className="absolute right-0 top-full mt-3 z-50 flex flex-col gap-3 min-w-[260px] p-5 comic-shadow comic-pop"
                      style={{ background: '#000000', borderColor: '#ffffff' }}
                    >
                      <h4
                        style={{
                          fontFamily: 'Bangers, cursive',
                          fontSize: '20px',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: '#ffffff',
                          borderBottom: '2px solid #ffffff',
                          paddingBottom: '8px',
                          marginBottom: '4px',
                        }}
                      >
                        YOUR ACCOUNT
                      </h4>
                      <div className="flex flex-col gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>
                        {[
                          { label: 'NAME', value: dbUser?.name || user.displayName || 'Unknown' },
                          { label: 'EMAIL', value: dbUser?.email || user.email || 'N/A' },
                          ...(dbUser?.phone ? [{ label: 'PHONE', value: dbUser.phone }] : []),
                          ...(dbUser?.college ? [{ label: 'COLLEGE', value: dbUser.college }] : []),
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
                            <div>{value}</div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => { setShowUserCard(false); playSynthSound('laser'); logout(); }}
                        className="comic-btn w-full"
                        style={{ fontSize: '16px', padding: '8px 16px', marginTop: '4px', background: '#ffffff', color: '#000000' }}
                      >
                        <LogOut size={13} className="mr-1 inline" /> LOG OUT //
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => playSynthSound('laser')}
                className="comic-btn"
                style={{ fontSize: '16px', padding: '6px 16px', background: '#ffffff', color: '#000000', borderColor: '#000000' }}
              >
                <LogIn size={14} className="mr-1 inline" /> LOGIN
              </Link>
            )
          )}
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
          ...(user ? [{ to: '/my-registrations', label: 'My Panels' }] : []),
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
              textDecoration: isActive(to) ? 'underline wavy' : 'none',
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

import React, { useCallback, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { getTheme, toggleTheme as triggerToggleTheme } from '../lib/theme';
import { getMyRegistrations, getUser } from '../lib/firestore';
import { playSynthSound, setSoundEnabled } from '../lib/audio';
import { Volume2, VolumeX, Sun, Moon, LogIn, LogOut, User, Menu, X } from 'lucide-react';

export function Navbar() {
  console.log("[Mount] Navbar component loaded");
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const [theme, setTheme] = useState(getTheme);
  const [hasRegistrations, setHasRegistrations] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [sfxOn, setSfxOn] = useState(true);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const navLink = (to: string, label: string, onClickExtra?: () => void) => (
    <Link
      key={to}
      to={to}
      onClick={() => {
        playSynthSound('click');
        if (onClickExtra) onClickExtra();
      }}
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
    <>
      <nav
        className="relative z-50 mx-auto max-w-7xl w-[92%] mt-6 p-4 comic-shadow flex justify-between items-center gap-4"
        style={{ background: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}
      >
        {/* Left side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Toggle (top left) */}
          <button
            onClick={() => {
              playSynthSound('click');
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none md:hidden relative z-[60]"
            aria-label="Toggle Navigation Menu"
          >
            {/* Morphing Hamburger lines */}
            <span
              className="w-6 h-[3px] bg-primary transition-all duration-300 transform origin-left"
              style={{
                transform: isSidebarOpen ? 'rotate(45deg) translate(2px, -2px)' : 'none',
                backgroundColor: 'var(--color-text-primary)'
              }}
            />
            <span
              className="w-6 h-[3px] bg-primary transition-all duration-300"
              style={{
                opacity: isSidebarOpen ? 0 : 1,
                transform: isSidebarOpen ? 'scale(0)' : 'none',
                backgroundColor: 'var(--color-text-primary)'
              }}
            />
            <span
              className="w-6 h-[3px] bg-primary transition-all duration-300 transform origin-left"
              style={{
                transform: isSidebarOpen ? 'rotate(-45deg) translate(2px, 2px)' : 'none',
                backgroundColor: 'var(--color-text-primary)'
              }}
            />
          </button>

          {/* Wordmark Logo */}
          <Link
            to="/"
            onClick={() => playSynthSound('click')}
            style={{ display: 'inline-flex', items: 'center', textDecoration: 'none' }}
          >
            <img
              src={theme === 'dark' ? '/LogoD.jpeg' : '/LogoL.jpeg'}
              alt="SPECTRUM 26"
              style={{ maxHeight: '70px', width: 'auto', aspectRatio: '2/1', objectFit: 'contain', display: 'block' }}
            />
          </Link>
        </div>

        {/* Right side: desktop links + controls */}
        <div className="flex items-center gap-6">
          {/* Desktop nav menu */}
          <div className="hidden md:flex gap-6 items-center">
            {navLink('/', 'Home')}
            {navLink('/events', 'Events')}
            {navLink('/schedule', 'Schedule')}
            {navLink('/winners', 'Winners')}
            {user && hasRegistrations && navLink('/my-registrations', 'My Passes')}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Swap */}
            <button
              onClick={handleToggleTheme}
              className="comic-shadow-sm"
              style={{
                background: 'var(--panel-bg)',
                color: 'var(--color-text-primary)',
                fontFamily: 'Bangers, cursive',
                fontSize: '18px',
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '0.04em',
                cursor: 'pointer',
              }}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              <span className="hidden sm:inline">SWAP</span>
            </button>

            {/* User Account / Auth */}
            {!loading && (
              user ? (
                <div className="relative">
                  <button
                    onClick={() => { playSynthSound('click'); setShowUserCard(!showUserCard); }}
                    className="comic-btn-outline"
                    style={{ fontSize: '14px', padding: '6px 14px' }}
                  >
                    <User size={13} className="mr-1 inline" />
                    <span className="hidden md:inline">{dbUser?.name || user.displayName || 'AGENT'}</span>
                  </button>

                  {showUserCard && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserCard(false)} />
                      <div
                        className="absolute right-0 top-full mt-3 z-50 flex flex-col gap-3 min-w-[260px] p-5 comic-shadow comic-pop"
                        style={{ background: 'var(--panel-bg)' }}
                      >
                        <h4
                          style={{
                            fontFamily: 'Bangers, cursive',
                            fontSize: '20px',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: 'var(--color-text-primary)',
                            borderBottom: '2px solid var(--border-color)',
                            paddingBottom: '8px',
                            marginBottom: '4px',
                          }}
                        >
                          YOUR ACCOUNT
                        </h4>
                        <div className="flex flex-col gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 500 }}>
                          {[
                            { label: 'NAME', value: dbUser?.name || user.displayName || 'User' },
                            ...((dbUser?.email || user.email) ? [{ label: 'EMAIL', value: dbUser?.email || user.email }] : []),
                            ...((dbUser?.phone || user.phoneNumber) ? [{ label: 'PHONE', value: dbUser?.phone || user.phoneNumber }] : []),
                            ...(dbUser?.college ? [{ label: 'COLLEGE', value: dbUser.college }] : []),
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <div style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
                              <div style={{ color: 'var(--color-text-primary)' }}>{value}</div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => { setShowUserCard(false); playSynthSound('laser'); logout(); }}
                          className="comic-btn w-full"
                          style={{ fontSize: '16px', padding: '8px 16px', marginTop: '4px' }}
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
                  className="comic-shadow-sm text-[11px] sm:text-[18px] hidden md:flex"
                  style={{
                    background: 'var(--panel-bg)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'Bangers, cursive',
                    padding: '6px 16px',
                    alignItems: 'center',
                    gap: '8px',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    border: '2px solid var(--border-color)',
                  }}
                >
                  <LogIn size={14} className="mr-1 inline" /> SIGN IN
                </Link>
              )
            )}

            {/* REGISTER Button (far right) */}
            <Link
              to="/events"
              onClick={() => playSynthSound('laser')}
              className="comic-shadow-sm hidden md:flex"
              style={{
                background: 'var(--color-text-primary)',
                color: 'var(--color-bg-base)',
                fontFamily: 'Bangers, cursive',
                fontSize: '18px',
                padding: '6px 16px',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                textDecoration: 'none',
                border: '2px solid var(--color-bg-base)',
              }}
            >
              REGISTER
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Sidebar (slides in from left) */}
      <div
        className={`fixed inset-0 z-45 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-bg-card border-r-4 border-primary p-8 flex flex-col gap-8 transition-transform duration-300 ease-in-out md:hidden`}
        style={{
          background: 'var(--panel-bg)',
          borderColor: 'var(--border-color)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div className="flex justify-between items-center border-b border-border-default pb-4">
          <span style={{ fontFamily: 'Bangers, cursive', fontSize: '24px', letterSpacing: '0.05em', color: 'var(--color-text-primary)' }}>
            NAVIGATION
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-text-secondary hover:text-primary transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-6 align-left text-left">
          {navLink('/', 'Home', () => setIsSidebarOpen(false))}
          {navLink('/events', 'Events', () => setIsSidebarOpen(false))}
          {navLink('/schedule', 'Schedule', () => setIsSidebarOpen(false))}
          {navLink('/winners', 'Winners', () => setIsSidebarOpen(false))}
          {user && hasRegistrations && navLink('/my-registrations', 'My Passes', () => setIsSidebarOpen(false))}
        </div>

        {/* Sidebar bottom CTAs */}
        <div className="mt-auto flex flex-col gap-3 pt-4 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
          {!loading && !user && (
            <Link
              to="/login"
              onClick={() => { setIsSidebarOpen(false); playSynthSound('laser'); }}
              className="comic-shadow-sm flex items-center justify-center gap-2"
              style={{
                background: 'var(--panel-bg)',
                color: 'var(--color-text-primary)',
                fontFamily: 'Bangers, cursive',
                fontSize: '18px',
                padding: '8px 16px',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                border: '2px solid var(--border-color)',
              }}
            >
              <LogIn size={14} /> SIGN IN
            </Link>
          )}
          <Link
            to="/events"
            onClick={() => { setIsSidebarOpen(false); playSynthSound('laser'); }}
            className="comic-shadow-sm flex items-center justify-center gap-2"
            style={{
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg-base)',
              fontFamily: 'Bangers, cursive',
              fontSize: '18px',
              padding: '8px 16px',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              border: '2px solid var(--color-bg-base)',
            }}
          >
            REGISTER
          </Link>
        </div>
      </aside>
    </>
  );
}

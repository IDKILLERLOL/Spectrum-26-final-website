import React, { useCallback, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { getMyRegistrations, getUser } from '../lib/firestore';
import { playSynthSound, setSoundEnabled } from '../lib/audio';
import { Volume2, VolumeX, Sun, Moon, LogIn, LogOut, User, Menu, X } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const [theme] = useState('dark');
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
        className="sticky top-0 z-[100] mx-auto max-w-7xl w-[92%] p-4 flex justify-between items-center gap-4"
        style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
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
            className="hidden sm:inline-flex items-center text-decoration-none"
          >
            <img
              src="/new_logo.png"
              alt="SPECTRUM 26"
              style={{ maxHeight: '70px', width: 'auto', objectFit: 'contain', display: 'block' }}
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
            {navLink('/gallery', 'Gallery')}
            {navLink('/contact', 'Contact')}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">

            {/* REGISTER Button (far right) */}
            <Link
              to="/events"
              onClick={() => playSynthSound('laser')}
              className="hidden md:flex"
              style={{
                background: 'transparent',
                color: 'var(--color-text-primary)',
                fontFamily: 'Bangers, cursive',
                fontSize: '20px',
                padding: '6px 0',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                textDecoration: 'none',
                border: 'none',
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-primary)';
                (e.currentTarget as HTMLAnchorElement).style.textShadow = '0 0 10px rgba(255, 51, 51, 0.8)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-primary)';
                (e.currentTarget as HTMLAnchorElement).style.textShadow = 'none';
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
        className="fixed inset-y-0 left-0 z-50 w-[280px] border-r-4 p-8 flex flex-col gap-8 transition-transform duration-300 ease-in-out md:hidden backdrop-blur-md"
        style={{
          background: 'rgba(14, 22, 38, 0.95)',
          borderColor: 'var(--border-color)',
          color: 'var(--color-text-primary)',
          backdropFilter: 'blur(16px)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div className="flex justify-between items-center pb-4">
          <span style={{ fontFamily: 'Bangers, cursive', fontSize: '24px', letterSpacing: '0.05em', color: 'var(--color-text-primary)' }}>
            NAVIGATION
          </span>
        </div>

        <div className="flex flex-col gap-6 align-left text-left">
          {navLink('/', 'Home', () => setIsSidebarOpen(false))}
          {navLink('/events', 'Events', () => setIsSidebarOpen(false))}
          {navLink('/schedule', 'Schedule', () => setIsSidebarOpen(false))}
          {navLink('/winners', 'Winners', () => setIsSidebarOpen(false))}
          {navLink('/gallery', 'Gallery', () => setIsSidebarOpen(false))}
          {navLink('/contact', 'Contact', () => setIsSidebarOpen(false))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
          <Link
            to="/events"
            onClick={() => { setIsSidebarOpen(false); playSynthSound('laser'); }}
            style={{
              background: 'transparent',
              color: 'var(--color-primary)',
              fontFamily: 'Bangers, cursive',
              fontSize: '20px',
              padding: '10px 16px',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              border: '2px solid var(--color-primary)',
              textAlign: 'center',
              display: 'block',
              width: '100%',
            }}
          >
            REGISTER
          </Link>
        </div>
      </aside>
    </>
  );
}

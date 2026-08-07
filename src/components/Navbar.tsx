import React, { useCallback, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { getMyRegistrations, getUser } from '../lib/firestore';
import { playSynthSound, setSoundEnabled } from '../lib/audio';
import { Volume2, VolumeX, Sun, Moon, LogIn, LogOut, User, Menu, X, Home, Calendar, Trophy, Mail, MoreHorizontal } from 'lucide-react';

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
        className="sticky top-0 z-[100] w-full px-6 py-4 flex justify-between items-center gap-4 border-b"
        style={{
          background: 'rgba(6, 11, 25, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Left side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Toggle (hidden on mobile now since bottom nav handles it) */}
          <button
            onClick={() => {
              playSynthSound('click');
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className="hidden flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none md:hidden relative z-[60]"
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
            className="inline-flex items-center text-decoration-none"
          >
            <img
              src="/new_logo.png"
              alt="SPECTRUM 26"
              style={{ maxHeight: '42px', width: 'auto', objectFit: 'contain', display: 'block' }}
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

      {/* Mobile Bottom Navigation Bar */}
      <div 
        className="md:hidden flex justify-around items-center py-2 px-2 border-t"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'rgba(6, 11, 25, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)'
        }}
      >
        {/* Schedule Slot */}
        <Link 
          to="/schedule" 
          onClick={() => playSynthSound('click')}
          className="flex flex-col items-center gap-0.5 text-center flex-1"
          style={{ color: location.pathname === '/schedule' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        >
          <Calendar size={20} />
          <span style={{ fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>SCHEDULE</span>
        </Link>

        {/* Events Slot */}
        <Link 
          to="/events" 
          onClick={() => playSynthSound('click')}
          className="flex flex-col items-center gap-0.5 text-center flex-1"
          style={{ color: location.pathname === '/events' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        >
          <Trophy size={20} />
          <span style={{ fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>EVENTS</span>
        </Link>

        {/* Home Slot (Center, highlighted) */}
        <Link 
          to="/" 
          onClick={() => playSynthSound('click')}
          className="flex flex-col items-center justify-center -mt-6 bg-primary rounded-full w-14 h-14 shadow-lg border-4 border-bg-base relative z-10"
          style={{
            borderColor: 'rgba(6, 11, 25, 1)',
            boxShadow: '0 4px 15px rgba(255, 51, 51, 0.4)'
          }}
        >
          <Home size={22} className="text-white" />
        </Link>

        {/* Contact Slot */}
        <Link 
          to="/contact" 
          onClick={() => playSynthSound('click')}
          className="flex flex-col items-center gap-0.5 text-center flex-1"
          style={{ color: location.pathname === '/contact' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        >
          <Mail size={20} />
          <span style={{ fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>CONTACT</span>
        </Link>

        {/* More Slot (Toggles drawer) */}
        <button 
          onClick={() => { playSynthSound('click'); setIsSidebarOpen(!isSidebarOpen); }}
          className="flex flex-col items-center gap-0.5 text-center flex-1"
          style={{ color: isSidebarOpen ? 'var(--color-primary)' : 'var(--color-text-muted)', background: 'none', border: 'none', padding: 0 }}
        >
          <MoreHorizontal size={20} />
          <span style={{ fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>MORE</span>
        </button>
      </div>
    </>
  );
}

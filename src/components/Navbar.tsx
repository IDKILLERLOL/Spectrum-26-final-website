import React, { useCallback, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { getMyRegistrations, getUser } from '../lib/firestore';
import { playSynthSound, setSoundEnabled } from '../lib/audio';
import { Volume2, VolumeX, Sun, Moon, LogIn, LogOut, User, Menu, X, Home, Calendar, Trophy, Mail, MoreHorizontal, Award } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const [theme] = useState('dark');
  const [hasRegistrations, setHasRegistrations] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [sfxOn, setSfxOn] = useState(true);
  
  // Mobile More Pop-up Menu State
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
    <div className="sticky top-4 z-[100] w-full flex justify-center pointer-events-none">
      <nav
        className="pointer-events-auto max-w-5xl w-[88%] py-3.5 px-8 flex justify-between items-center gap-6 border"
        style={{
          background: 'rgba(6, 11, 25, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Left side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Toggle (hidden on mobile now since bottom nav handles it) */}
          <button
            onClick={() => {
              playSynthSound('click');
              setShowMoreMenu(!showMoreMenu);
            }}
            className="hidden flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none md:hidden relative z-[60]"
            aria-label="Toggle Navigation Menu"
          >
            <span
              className="w-6 h-[3px] bg-primary transition-all duration-300 transform origin-left"
              style={{
                transform: showMoreMenu ? 'rotate(45deg) translate(2px, -2px)' : 'none',
                backgroundColor: 'var(--color-text-primary)'
              }}
            />
            <span
              className="w-6 h-[3px] bg-primary transition-all duration-300"
              style={{
                opacity: showMoreMenu ? 0 : 1,
                transform: showMoreMenu ? 'scale(0)' : 'none',
                backgroundColor: 'var(--color-text-primary)'
              }}
            />
            <span
              className="w-6 h-[3px] bg-primary transition-all duration-300 transform origin-left"
              style={{
                transform: showMoreMenu ? 'rotate(-45deg) translate(2px, 2px)' : 'none',
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
    </div>

      {/* Mobile More Pop-up Menu */}
      {showMoreMenu && (
        <div 
          className="md:hidden fixed bottom-[72px] right-4 z-[9999] flex flex-col gap-1 p-2 border shadow-2xl"
          style={{
            background: 'rgba(10, 15, 30, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            minWidth: '160px'
          }}
        >
          {/* Winners Link */}
          <Link
            to="/winners"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className="flex items-center gap-3 px-3 py-2 text-white hover:text-primary hover:bg-white/5 transition-all"
            style={{ textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600 }}
          >
            <Trophy size={14} className="text-primary" />
            <span>WINNERS</span>
          </Link>

          {/* Gallery Link */}
          <Link
            to="/gallery"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className="flex items-center gap-3 px-3 py-2 text-white hover:text-primary hover:bg-white/5 transition-all"
            style={{ textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600 }}
          >
            <Award size={14} className="text-primary" />
            <span>GALLERY</span>
          </Link>

          {/* Account Profile / Login */}
          {user ? (
            <Link
              to="/profile"
              onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
              className="flex items-center gap-3 px-3 py-2 text-white hover:text-primary hover:bg-white/5 transition-all"
              style={{ textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600 }}
            >
              <User size={14} className="text-primary" />
              <span>MY PROFILE</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
              className="flex items-center gap-3 px-3 py-2 text-white hover:text-primary hover:bg-white/5 transition-all"
              style={{ textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600 }}
            >
              <LogIn size={14} className="text-primary" />
              <span>LOGIN</span>
            </Link>
          )}

          {/* Supercore (Admin) */}
          {dbUser?.role === 'ADMIN' && (
            <Link
              to="/supercore"
              onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
              className="flex items-center gap-3 px-3 py-2 text-white hover:text-primary hover:bg-white/5 transition-all border-t border-white/10 mt-1 pt-1.5"
              style={{ textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600 }}
            >
              <Menu size={14} className="text-primary" />
              <span>SUPERCORE</span>
            </Link>
          )}
        </div>
      )}

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
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)'
        }}
      >
        {/* Schedule Slot */}
        <Link 
          to="/schedule" 
          onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
          className="flex flex-col items-center gap-0.5 text-center flex-1"
          style={{ color: location.pathname === '/schedule' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        >
          <Calendar size={20} />
          <span style={{ fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>SCHEDULE</span>
        </Link>

        {/* Events Slot */}
        <Link 
          to="/events" 
          onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
          className="flex flex-col items-center gap-0.5 text-center flex-1"
          style={{ color: location.pathname === '/events' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        >
          <Trophy size={20} />
          <span style={{ fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>EVENTS</span>
        </Link>

        {/* Home Slot (Center, highlighted) */}
        <Link 
          to="/" 
          onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
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
          onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
          className="flex flex-col items-center gap-0.5 text-center flex-1"
          style={{ color: location.pathname === '/contact' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        >
          <Mail size={20} />
          <span style={{ fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>CONTACT</span>
        </Link>

        {/* More Slot (Toggles pop-up) */}
        <button 
          onClick={() => { playSynthSound('click'); setShowMoreMenu(!showMoreMenu); }}
          className="flex flex-col items-center gap-0.5 text-center flex-1"
          style={{ color: showMoreMenu ? 'var(--color-primary)' : 'var(--color-text-muted)', background: 'none', border: 'none', padding: 0 }}
        >
          <MoreHorizontal size={20} />
          <span style={{ fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>MORE</span>
        </button>
      </div>
    </>
  );
}

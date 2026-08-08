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
      <div className="sticky top-4 z-[100] w-full flex justify-center pointer-events-none px-3">
        <nav
          className="pointer-events-auto max-w-6xl w-full py-3.5 px-6 flex justify-between items-center gap-6 border rounded-sm"
          style={{
            background: 'rgba(8, 12, 22, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'rgba(255, 51, 51, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Left side: Brand Logo with Horns emblem & 8-bit title */}
          <Link
            to="/"
            onClick={() => playSynthSound('click')}
            className="flex items-center gap-2.5 text-decoration-none group"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center border border-red-500/50 shadow-[0_0_12px_rgba(255,51,51,0.5)]">
              <span className="text-red-400 font-bold text-sm">😈</span>
            </div>
            <div className="flex flex-col">
              <span className="font-pixel text-base sm:text-lg tracking-wider text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                SPECTRUM <span className="text-red-500 font-pixel">5.0</span>
              </span>
            </div>
          </Link>

          {/* Desktop nav menu */}
          <div className="hidden lg:flex gap-7 items-center">
            {navLink('/', 'HOME')}
            {navLink('/events', 'EVENTS')}
            {navLink('/schedule', 'SCHEDULE')}
            {navLink('/winners', 'WINNERS')}
            {navLink('/gallery', 'GALLERY')}
            {navLink('/contact', 'CONTACT')}
          </div>

          {/* Right side: Social icons & Register Button */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white hover:border-red-500/50 transition-colors"
              aria-label="Instagram"
            >
              <span className="text-xs font-mono">📷</span>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white hover:border-red-500/50 transition-colors"
              aria-label="Discord"
            >
              <span className="text-xs font-mono">🎮</span>
            </a>

            <Link
              to="/events"
              onClick={() => playSynthSound('laser')}
              className="px-5 py-2.5 rounded bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-600 text-white font-pixel text-xs uppercase tracking-wider border border-red-400/50 shadow-[0_0_15px_rgba(255,51,51,0.5)] hover:shadow-[0_0_25px_rgba(255,51,51,0.8)] transition-all flex items-center gap-1.5 font-bold"
            >
              REGISTER NOW <span className="text-sm">→</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger Toggle Button */}
          <button
            onClick={() => {
              playSynthSound('click');
              setShowMoreMenu(!showMoreMenu);
            }}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 border border-white/20 rounded bg-white/5 text-white"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
        </nav>
      </div>

      {/* Mobile Pop-up Menu */}
      {showMoreMenu && (
        <div
          className="lg:hidden fixed bottom-24 right-4 z-[9999] flex flex-col gap-1 p-3 border rounded-lg shadow-2xl"
          style={{
            background: 'rgba(8, 12, 22, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: 'rgba(255, 51, 51, 0.4)',
            minWidth: '200px',
          }}
        >
          <Link
            to="/"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className="flex items-center gap-3 px-3 py-2.5 text-white hover:text-red-400 hover:bg-white/5 rounded transition-all font-pixel text-xs"
          >
            <Home size={14} className="text-red-500" />
            <span>HOME</span>
          </Link>
          <Link
            to="/events"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className="flex items-center gap-3 px-3 py-2.5 text-white hover:text-red-400 hover:bg-white/5 rounded transition-all font-pixel text-xs"
          >
            <Trophy size={14} className="text-red-500" />
            <span>EVENTS</span>
          </Link>
          <Link
            to="/schedule"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className="flex items-center gap-3 px-3 py-2.5 text-white hover:text-red-400 hover:bg-white/5 rounded transition-all font-pixel text-xs"
          >
            <Calendar size={14} className="text-red-500" />
            <span>SCHEDULE</span>
          </Link>
          <Link
            to="/winners"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className="flex items-center gap-3 px-3 py-2.5 text-white hover:text-red-400 hover:bg-white/5 rounded transition-all font-pixel text-xs"
          >
            <Award size={14} className="text-red-500" />
            <span>WINNERS</span>
          </Link>
          <Link
            to="/contact"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className="flex items-center gap-3 px-3 py-2.5 text-white hover:text-red-400 hover:bg-white/5 rounded transition-all font-pixel text-xs"
          >
            <Mail size={14} className="text-red-500" />
            <span>CONTACT</span>
          </Link>

          {dbUser?.role === 'ADMIN' && (
            <Link
              to="/supercore"
              onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
              className="flex items-center gap-3 px-3 py-2 text-white hover:text-red-400 hover:bg-white/5 rounded transition-all border-t border-white/10 mt-1 pt-2 font-pixel text-xs"
            >
              <Menu size={14} className="text-red-500" />
              <span>SUPERCORE</span>
            </Link>
          )}
        </div>
      )}

      {/* Mobile Floating Bottom Dock */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[9990] flex flex-col items-center gap-2 pb-3 px-4 pointer-events-none">
        {/* Floating REGISTER NOW Button */}
        <Link
          to="/events"
          onClick={() => playSynthSound('laser')}
          className="pointer-events-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white font-pixel text-xs uppercase tracking-wider border border-red-400/60 shadow-[0_0_20px_rgba(255,51,51,0.8)] flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
        >
          <span>★</span> REGISTER NOW <span>→ ★</span>
        </Link>

        {/* Glassmorphic Nav Bar */}
        <div
          className="pointer-events-auto w-full max-w-md py-2.5 px-4 flex justify-between items-center rounded-2xl border"
          style={{
            background: 'rgba(8, 12, 22, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(255, 51, 51, 0.25)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)',
          }}
        >
          <Link
            to="/"
            onClick={() => playSynthSound('click')}
            className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
          >
            <Home size={18} />
            <span className="font-pixel text-[9px]">HOME</span>
          </Link>

          <Link
            to="/events"
            onClick={() => playSynthSound('click')}
            className={`flex flex-col items-center gap-1 ${location.pathname === '/events' ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
          >
            <span className="text-sm">⚔️</span>
            <span className="font-pixel text-[9px]">EVENTS</span>
          </Link>

          <Link
            to="/schedule"
            onClick={() => playSynthSound('click')}
            className={`flex flex-col items-center gap-1 ${location.pathname === '/schedule' ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
          >
            <Calendar size={18} />
            <span className="font-pixel text-[9px]">SCHEDULE</span>
          </Link>

          <Link
            to="/winners"
            onClick={() => playSynthSound('click')}
            className={`flex flex-col items-center gap-1 ${location.pathname === '/winners' ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
          >
            <Trophy size={18} />
            <span className="font-pixel text-[9px]">WINNERS</span>
          </Link>

          <Link
            to="/contact"
            onClick={() => playSynthSound('click')}
            className={`flex flex-col items-center gap-1 ${location.pathname === '/contact' ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
          >
            <Mail size={18} />
            <span className="font-pixel text-[9px]">CONTACT</span>
          </Link>
        </div>
      </div>
    </>
  );
}

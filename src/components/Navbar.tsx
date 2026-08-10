import React, { useCallback, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { getMyRegistrations, getUser } from '../lib/firestore';
import { playSynthSound, setSoundEnabled } from '../lib/audio';
import { Volume2, VolumeX, Sun, Moon, LogIn, LogOut, User, Menu, X, Home, Calendar, Trophy, Mail, MoreHorizontal, Award, Instagram, Gamepad2, Terminal } from 'lucide-react';

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
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '9px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: 'var(--color-text-primary)',
        textDecoration: isActive(to) ? 'underline' : 'none',
        textDecorationStyle: isActive(to) ? 'solid' : undefined,
        textDecorationThickness: isActive(to) ? '2px' : undefined,
        textUnderlineOffset: '6px',
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
      <div className="">
        <nav
          className=""
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
            className=""
          >
            <div className="">
              <Terminal className="" size={16} />
            </div>
            <div className="">
              <span className="">
                SPECTRUM <span className="">5.0</span>
              </span>
            </div>
          </Link>

          {/* Desktop nav menu */}
          <div className="">
            {navLink('/', 'HOME')}
            {navLink('/events', 'EVENTS')}
            {navLink('/schedule', 'SCHEDULE')}
            {navLink('/winners', 'WINNERS')}
            {navLink('/sponsors', 'SPONSORS')}
            {navLink('/gallery', 'GALLERY')}
            {navLink('/contact', 'CONTACT')}
          </div>

          {/* Right side: Social icons & Register Button */}
          <div className="">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className=""
              aria-label="Instagram"
            >
              <Instagram size={15} />
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className=""
              aria-label="Discord"
            >
              <Gamepad2 size={15} />
            </a>

            <Link
              to="/events"
              onClick={() => playSynthSound('laser')}
              className=""
            >
              REGISTER NOW <span className="">→</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger Toggle Button */}
          <button
            onClick={() => {
              playSynthSound('click');
              setShowMoreMenu(!showMoreMenu);
            }}
            className=""
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
        </nav>
      </div>

      {/* Mobile Pop-up Menu */}
      {showMoreMenu && (
        <div
          className=""
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
            className=""
          >
            <Home size={14} className="" />
            <span>HOME</span>
          </Link>
          <Link
            to="/events"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className=""
          >
            <Trophy size={14} className="" />
            <span>EVENTS</span>
          </Link>
          <Link
            to="/schedule"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className=""
          >
            <Calendar size={14} className="" />
            <span>SCHEDULE</span>
          </Link>
          <Link
            to="/winners"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className=""
          >
            <Award size={14} className="" />
            <span>WINNERS</span>
          </Link>
          <Link
            to="/sponsors"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className=""
          >
            <Award size={14} className="" />
            <span>SPONSORS</span>
          </Link>
          <Link
            to="/gallery"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className=""
          >
            <Award size={14} className="" />
            <span>GALLERY</span>
          </Link>
          <Link
            to="/contact"
            onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
            className=""
          >
            <Mail size={14} className="" />
            <span>CONTACT</span>
          </Link>

          {dbUser?.role === 'ADMIN' && (
            <Link
              to="/supercore"
              onClick={() => { playSynthSound('click'); setShowMoreMenu(false); }}
              className=""
            >
              <Menu size={14} className="" />
              <span>SUPERCORE</span>
            </Link>
          )}
        </div>
      )}

      {/* Mobile Floating Bottom Dock */}
      <div className="">
        {/* Floating REGISTER NOW Button */}
        <Link
          to="/events"
          onClick={() => playSynthSound('laser')}
          className=""
        >
          <span>★</span> REGISTER NOW <span>→ ★</span>
        </Link>

        {/* Glassmorphic Nav Bar */}
        <div
          className=""
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
            <span className="">HOME</span>
          </Link>

          <Link
            to="/events"
            onClick={() => playSynthSound('click')}
            className={`flex flex-col items-center gap-1 ${location.pathname === '/events' ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
          >
            <Gamepad2 size={18} />
            <span className="">EVENTS</span>
          </Link>

          <Link
            to="/schedule"
            onClick={() => playSynthSound('click')}
            className={`flex flex-col items-center gap-1 ${location.pathname === '/schedule' ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
          >
            <Calendar size={18} />
            <span className="">SCHEDULE</span>
          </Link>

          <Link
            to="/winners"
            onClick={() => playSynthSound('click')}
            className={`flex flex-col items-center gap-1 ${location.pathname === '/winners' ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
          >
            <Trophy size={18} />
            <span className="">WINNERS</span>
          </Link>

          <Link
            to="/contact"
            onClick={() => playSynthSound('click')}
            className={`flex flex-col items-center gap-1 ${location.pathname === '/contact' ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
          >
            <Mail size={18} />
            <span className="">CONTACT</span>
          </Link>
        </div>
      </div>
    </>
  );
}

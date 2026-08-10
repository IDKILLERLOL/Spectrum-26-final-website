import React, { useCallback, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { getUser } from '../lib/firestore';
import { playSynthSound, setSoundEnabled } from '../lib/audio';
import { getTheme, toggleTheme } from '../lib/theme';

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(getTheme());
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [sfxOn, setSfxOn] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) { setDbUser(null); return; }
    getUser(user.uid)
      .then((profile) => setDbUser(profile ?? { name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' }))
      .catch(() => setDbUser({ name: user.displayName || user.email?.split('@')[0] || 'User', email: user.email || '' }));
  }, [user]);

  // Ensure Lucide icon tags are converted on state toggles
  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [theme, sfxOn, isMobileMenuOpen]);

  const handleToggleTheme = () => {
    playSynthSound('click');
    toggleTheme(theme, (nextTheme) => {
      setTheme(nextTheme);
    });
  };

  const toggleSfx = () => {
    const next = !sfxOn;
    setSfxOn(next);
    setSoundEnabled(next);
    if (next) playSynthSound('click');
  };

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      {/* Top Navbar Container */}
      <header className="nav-bar">
        <div className="nav-inner">
          {/* Left side: Brand Logo */}
          <Link
            to="/"
            onClick={() => playSynthSound('click')}
            className="nav-logo"
          >
            <span className="nav-logo-text">SPECTRUM</span>
            <span className="nav-logo-version">5.0</span>
          </Link>

          {/* Desktop Nav menu */}
          <ul className="nav-links">
            <li><Link to="/" onClick={() => playSynthSound('click')} className={`nav-link ${isActive('/') ? 'is-active' : ''}`}>Home</Link></li>
            <li><Link to="/events" onClick={() => playSynthSound('click')} className={`nav-link ${isActive('/events') ? 'is-active' : ''}`}>Events</Link></li>
            <li><Link to="/schedule" onClick={() => playSynthSound('click')} className={`nav-link ${isActive('/schedule') ? 'is-active' : ''}`}>Schedule</Link></li>
            <li><Link to="/winners" onClick={() => playSynthSound('click')} className={`nav-link ${isActive('/winners') ? 'is-active' : ''}`}>Winners</Link></li>
            <li><Link to="/sponsors" onClick={() => playSynthSound('click')} className={`nav-link ${isActive('/sponsors') ? 'is-active' : ''}`}>Sponsors</Link></li>
            <li><Link to="/gallery" onClick={() => playSynthSound('click')} className={`nav-link ${isActive('/gallery') ? 'is-active' : ''}`}>Gallery</Link></li>
            <li><Link to="/contact" onClick={() => playSynthSound('click')} className={`nav-link ${isActive('/contact') ? 'is-active' : ''}`}>Contact</Link></li>
            {dbUser?.role === 'ADMIN' && (
              <li><Link to="/supercore" onClick={() => playSynthSound('click')} className={`nav-link ${isActive('/supercore') ? 'is-active' : ''}`}>Admin</Link></li>
            )}
          </ul>

          {/* Right side controls */}
          <div className="nav-actions">
            {/* SFX sound toggle */}
            <button
              onClick={toggleSfx}
              className="nav-icon-btn"
              aria-label="Toggle sound effects"
            >
              {sfxOn ? <i data-lucide="volume-2"></i> : <i data-lucide="volume-x"></i>}
            </button>

            {/* Theme switcher toggle */}
            <button
              onClick={handleToggleTheme}
              className="nav-icon-btn"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <i data-lucide="sun"></i> : <i data-lucide="moon"></i>}
            </button>

            {/* Register CTA button - desktop only */}
            <Link
              to="/events"
              onClick={() => playSynthSound('laser')}
              className="btn btn-primary nav-cta"
            >
              REGISTER NOW →
            </Link>

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => {
                playSynthSound('click');
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="nav-icon-btn nav-hamburger"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <i data-lucide="x"></i> : <i data-lucide="menu"></i>}
            </button>
          </div>
        </div>
      </header>

      {/* Hamburger Overlay Mobile Menu */}
      <div className={`nav-overlay ${isMobileMenuOpen ? 'is-open' : ''}`}>
        <ul className="nav-overlay-links">
          <li>
            <Link to="/" onClick={() => { playSynthSound('click'); setIsMobileMenuOpen(false); }} className={`nav-overlay-link ${isActive('/') ? 'is-active' : ''}`}>
              <span>Home</span>
              <i data-lucide="chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link to="/events" onClick={() => { playSynthSound('click'); setIsMobileMenuOpen(false); }} className={`nav-overlay-link ${isActive('/events') ? 'is-active' : ''}`}>
              <span>Events</span>
              <i data-lucide="chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link to="/schedule" onClick={() => { playSynthSound('click'); setIsMobileMenuOpen(false); }} className={`nav-overlay-link ${isActive('/schedule') ? 'is-active' : ''}`}>
              <span>Schedule</span>
              <i data-lucide="chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link to="/winners" onClick={() => { playSynthSound('click'); setIsMobileMenuOpen(false); }} className={`nav-overlay-link ${isActive('/winners') ? 'is-active' : ''}`}>
              <span>Winners</span>
              <i data-lucide="chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link to="/sponsors" onClick={() => { playSynthSound('click'); setIsMobileMenuOpen(false); }} className={`nav-overlay-link ${isActive('/sponsors') ? 'is-active' : ''}`}>
              <span>Sponsors</span>
              <i data-lucide="chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link to="/gallery" onClick={() => { playSynthSound('click'); setIsMobileMenuOpen(false); }} className={`nav-overlay-link ${isActive('/gallery') ? 'is-active' : ''}`}>
              <span>Gallery</span>
              <i data-lucide="chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => { playSynthSound('click'); setIsMobileMenuOpen(false); }} className={`nav-overlay-link ${isActive('/contact') ? 'is-active' : ''}`}>
              <span>Contact</span>
              <i data-lucide="chevron-right"></i>
            </Link>
          </li>
          {dbUser?.role === 'ADMIN' && (
            <li>
              <Link to="/supercore" onClick={() => { playSynthSound('click'); setIsMobileMenuOpen(false); }} className={`nav-overlay-link ${isActive('/supercore') ? 'is-active' : ''}`}>
                <span>Admin</span>
                <i data-lucide="chevron-right"></i>
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Mobile Bottom Tab Bar Navigation (<= 1023px) */}
      <nav className="tab-bar">
        <Link
          to="/"
          onClick={() => playSynthSound('click')}
          className={`tab-bar-item ${isActive('/') ? 'is-active' : ''}`}
        >
          <i data-lucide="house"></i>
          <span className="tab-bar-label">Home</span>
        </Link>
        <Link
          to="/events"
          onClick={() => playSynthSound('click')}
          className={`tab-bar-item ${isActive('/events') ? 'is-active' : ''}`}
        >
          <i data-lucide="gamepad-2"></i>
          <span className="tab-bar-label">Events</span>
        </Link>
        <Link
          to="/schedule"
          onClick={() => playSynthSound('click')}
          className={`tab-bar-item ${isActive('/schedule') ? 'is-active' : ''}`}
        >
          <i data-lucide="calendar-clock"></i>
          <span className="tab-bar-label">Schedule</span>
        </Link>
        <button
          onClick={() => {
            playSynthSound('click');
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          className="tab-bar-item"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <i data-lucide="ellipsis"></i>
          <span className="tab-bar-label">More</span>
        </button>
      </nav>
    </>
  );
}

import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutList, CalendarDays, CalendarClock, Trophy, Users, UserMinus, ScrollText, LogOut, Sun, Moon, RotateCw } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getTheme, toggleTheme as triggerToggleTheme } from '../lib/theme';

const NAV_ITEMS = [
  { to: '/admin/registrations', label: 'Registrations', Icon: LayoutList },
  { to: '/admin/accounts',      label: 'Accounts',       Icon: UserMinus },
  { to: '/admin/events',        label: 'Events',         Icon: CalendarDays },
  { to: '/admin/schedule',      label: 'Schedule',        Icon: CalendarClock },
  { to: '/admin/winners',       label: 'Winners',        Icon: Trophy },
  { to: '/admin/users',         label: 'Users',          Icon: Users },
  { to: '/admin/audit-log',     label: 'Audit Log',      Icon: ScrollText },
];


export function Sidebar() {
  console.log("[Mount] Sidebar component loaded");
  const location = useLocation();
  const navigate = useNavigate();
  const { adminEmail, adminLogout } = useAuth();
  const [theme, setTheme] = useState(getTheme);

  const handleToggleTheme = useCallback(() => {
    triggerToggleTheme(theme, (nextTheme) => {
      setTheme(nextTheme);
    });
  }, [theme]);

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin');
  };

  const handleReload = () => {
    window.dispatchEvent(new Event('spectrum26_reload_data'));
  };

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 border-r border-border-default shrink-0 min-h-screen"
        style={{ background: 'var(--color-bg-elevated)' }}
      >
        {/* Branding */}
        <div className="p-6 border-b border-border-default flex flex-col gap-1">
          <span className="font-hero tracking-widest text-lg uppercase text-primary">SPECTRUM 26</span>
          <span className="font-micro text-[10px] text-text-muted uppercase tracking-wider">Admin Console</span>
          {adminEmail && (
            <span
              className="font-body text-small text-text-secondary mt-2 truncate max-w-[200px]"
              title={adminEmail}
            >
              {adminEmail}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 p-4 gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-3 font-heading text-heading uppercase tracking-wider transition-colors"
              style={{
                color: isActive(to) ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                background: isActive(to) ? 'var(--color-bg-card)' : 'transparent',
                borderLeft: isActive(to) ? '3px solid var(--color-text-primary)' : '3px solid transparent',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Theme and Logout controls */}
        <div className="p-4 border-t border-border-default flex flex-col gap-2">
          <button
            onClick={handleReload}
            className="flex items-center gap-3 px-4 py-2 w-full font-heading text-heading uppercase tracking-wide text-text-secondary hover:text-primary transition-colors"
          >
            <RotateCw size={17} />
            Reload Data
          </button>
          <button
            onClick={handleToggleTheme}
            className="flex items-center gap-3 px-4 py-2 w-full font-heading text-heading uppercase tracking-wide text-text-secondary hover:text-primary transition-colors"
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            Toggle Theme
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full font-heading text-heading uppercase tracking-wide text-text-secondary hover:text-primary transition-colors"
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>
 
      {/* Mobile: top tab bar */}
      <div
        className="lg:hidden flex border-b border-border-default overflow-x-auto fixed top-0 left-0 right-0 z-50"
        style={{ background: 'var(--color-bg-elevated)' }}
      >
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 px-4 py-3 shrink-0 font-micro text-micro uppercase tracking-widest transition-all"
            style={{
              color: isActive(to) ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              borderBottom: isActive(to) ? '2px solid var(--color-text-primary)' : '2px solid transparent',
            }}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <button
          onClick={handleReload}
          className="flex flex-col items-center gap-1 px-4 py-3 shrink-0 font-micro text-micro uppercase tracking-widest text-text-muted hover:text-primary transition-colors ml-auto"
        >
          <RotateCw size={16} />
          Reload
        </button>
        <button
          onClick={handleToggleTheme}
          className="flex flex-col items-center gap-1 px-4 py-3 shrink-0 font-micro text-micro uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          Theme
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-3 shrink-0 font-micro text-micro uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
        >
          <LogOut size={16} /> Out
        </button>
      </div>
 
      {/* Mobile: spacer to push content below fixed tab bar */}
      <div className="lg:hidden h-[62px]" />
    </>
  );
}

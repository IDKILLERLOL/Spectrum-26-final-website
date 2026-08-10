import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutList, CalendarDays, CalendarClock, Trophy, Users, UserMinus, ScrollText, LogOut, Sun, Moon, RotateCw, Settings } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getTheme, toggleTheme as triggerToggleTheme } from '../lib/theme';

const NAV_ITEMS = [
  { to: '/supercore/registrations', label: 'Registrations', Icon: LayoutList },
  { to: '/supercore/accounts',      label: 'Accounts',       Icon: UserMinus },
  { to: '/supercore/events',        label: 'Events',         Icon: CalendarDays },
  { to: '/supercore/schedule',      label: 'Schedule',        Icon: CalendarClock },
  { to: '/supercore/winners',       label: 'Winners',        Icon: Trophy },
  { to: '/supercore/users',         label: 'Users',          Icon: Users },
  { to: '/supercore/global-details', label: 'Global Details', Icon: Settings },
  { to: '/supercore/audit-log',     label: 'Audit Log',      Icon: ScrollText },
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
    navigate('/supercore');
  };

  const handleReload = () => {
    window.dispatchEvent(new Event('spectrum26_reload_data'));
  };

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className=""
        style={{ background: 'var(--color-bg-elevated)' }}
      >
        {/* Branding */}
        <div className="">
          <span className="">SPECTRUM 26</span>
          <span className="">Admin Console</span>
          {adminEmail && (
            <span
              className=""
              title={adminEmail}
            >
              {adminEmail}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className=""
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
        <div className="">
          <button
            onClick={handleReload}
            className=""
          >
            <RotateCw size={17} />
            Reload Data
          </button>
          <button
            onClick={handleLogout}
            className=""
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>
 
      {/* Mobile: top tab bar */}
      <div
        className=""
        style={{ background: 'var(--color-bg-elevated)' }}
      >
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className=""
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
          className=""
        >
          <RotateCw size={16} />
          Reload
        </button>
        <button
          onClick={handleLogout}
          className=""
        >
          <LogOut size={16} /> Out
        </button>
      </div>
 
      {/* Mobile: spacer to push content below fixed tab bar */}
      <div className="" />
    </>
  );
}

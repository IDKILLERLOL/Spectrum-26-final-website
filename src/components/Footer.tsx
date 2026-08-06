import { Link } from 'react-router-dom';
import { EVENT_DATE } from '../config';
import { playSynthSound } from '../lib/audio';

export function Footer() {
  const formattedDate = EVENT_DATE.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="w-full mt-12" style={{ backgroundColor: '#060b13' }}>
      <footer
        className="relative z-10 max-w-7xl mx-auto w-[92%] flex flex-wrap justify-between items-center gap-6 py-6"
        style={{ background: 'transparent' }}
      >
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <span
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: '24px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-12deg)',
            display: 'inline-block',
          }}
        >
          SPECTRUM 26
        </span>
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            opacity: 0.6,
            fontVariantLigatures: 'none',
          }}
        >
          // ALL SYSTEMS GO
        </span>
      </div>

      {/* Links */}
      <div className="flex gap-6" style={{ fontFamily: 'Bangers, cursive', fontSize: '20px', letterSpacing: '0.05em' }}>
        {[
          { to: '/contact', label: 'Contact' },
          { to: '/schedule', label: 'Schedule' },
          { to: '/winners', label: 'Winners' },
          { to: '/gallery', label: 'Gallery' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            onClick={() => playSynthSound('click')}
            style={{
              color: 'var(--color-text-primary)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'text-decoration 0.1s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Copyright */}
      <div
        style={{
          fontFamily: 'Space Grotesk, monospace',
          fontSize: '11px',
          fontWeight: 600,
          opacity: 0.7,
          textAlign: 'right',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        © 2026 SPECTRUM CO.
      </div>
    </footer>
    </div>
  );
}

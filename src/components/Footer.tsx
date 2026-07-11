import { Link } from 'react-router-dom';
import { EVENT_DATE } from '../config';

export function Footer() {
  const formattedDate = EVENT_DATE.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <footer className="w-full bg-bg-elevated border-t border-border-default mt-auto z-10">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 py-12 max-w-7xl mx-auto gap-5">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="font-hero text-ui-label text-primary uppercase tracking-widest">SPECTRUM 26</span>
          <span className="font-micro text-micro text-text-muted uppercase tracking-[0.08em]">{formattedDate}</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <Link to="/" className="font-micro text-micro text-text-muted hover:text-primary transition-colors uppercase tracking-[0.08em]">Contact</Link>
        </div>
        <div className="font-micro text-micro text-text-muted uppercase tracking-[0.08em] text-center md:text-right">
          © 2026 SPECTRUM TECH FESTIVAL.<br className="md:hidden" /> ALL SYSTEMS GO.
        </div>
      </div>
    </footer>
  );
}

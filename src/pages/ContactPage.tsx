import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playSynthSound } from '../lib/audio';
import { useState, useEffect } from 'react';

export function ContactPage() {
  console.log("[Mount] ContactPage component loaded");
  const [details, setDetails] = useState<any>(null);
  useEffect(() => {
    import('../lib/firestore').then(m => m.getEventDetails()).then(setDetails).catch(console.error);
  }, []);

  const email = details?.helplineEmail || 'spectrumsbmp@gmail.com';
  const phone = details?.helplinePhone || '+91 98765 43210';
  const locationText = details?.location || "SVKM's Shri Bhagubhai Mafatlal Polytechnic\nIrla, Vile Parle West, Mumbai, Maharashtra 400056";

  return (
    <main className="relative z-10 w-full min-h-screen py-12 px-6 max-w-4xl mx-auto flex flex-col gap-10">
      {/* Back button */}
      <Link
        to="/"
        onClick={() => playSynthSound('click')}
        className="inline-flex items-center gap-2 text-primary hover:opacity-75 transition-opacity font-heading text-heading uppercase w-fit"
        style={{ textDecoration: 'none' }}
      >
        <ArrowLeft size={20} /> Back to Home
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-4 pb-6" style={{ borderBottom: '4px solid var(--border-color)' }}>
        <span
          className="comic-badge inline-block"
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: '13px',
            padding: '3px 12px',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-base)',
            width: 'fit-content',
            transform: 'rotate(-1deg)',
          }}
        >
          GET IN TOUCH
        </span>
        <h1
          style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(44px, 8vw, 72px)',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
            transform: 'skewX(-4deg)',
          }}
        >
          Contact Support
        </h1>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', color: 'var(--color-text-secondary)', opacity: 0.8 }}>
          Have questions or need assistance with registrations and passes? Reach out to our crew.
        </p>
      </header>

      {/* Contact info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="p-6 comic-border-thick flex flex-col gap-6" style={{ background: 'var(--panel-bg)' }}>
          <div>
            <h3 style={{ fontFamily: 'Bangers, cursive', fontSize: '24px', letterSpacing: '0.04em', color: 'var(--color-text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
              REGISTRATION DESK
            </h3>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              For registration inquiries, pass upgrades, payments, and team matching assistance:
            </p>
            <ul className="mt-4 flex flex-col gap-3 font-body text-body text-text-secondary" style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <strong>Email:</strong> <a href={`mailto:${email}`} className="text-primary hover:opacity-75 transition-opacity" style={{ textDecoration: 'underline' }}>{email}</a>
              </li>
              <li>
                <strong>Phone Support:</strong>
                <div className="flex flex-col gap-1 mt-1 font-mono text-small">
                  {(details?.helplinePhones && details.helplinePhones.length > 0
                    ? details.helplinePhones
                    : ['+91 86574 78886', '+91 90046 20948', '+91 90210 95204']
                  ).map((pNum: string) => {
                    const cleanPhone = pNum.replace(/[^\d+]/g, '');
                    return (
                      <a
                        key={pNum}
                        href={`tel:${cleanPhone}`}
                        className="text-primary hover:opacity-75 transition-opacity"
                        style={{ textDecoration: 'underline' }}
                      >
                        {pNum}
                      </a>
                    );
                  })}
                </div>
              </li>
              <li>
                <strong>Hours:</strong> 9:00 AM - 5:00 PM IST (Mon - Sat)
              </li>
            </ul>
          </div>

          <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '16px' }}>
            <h3 style={{ fontFamily: 'Bangers, cursive', fontSize: '20px', letterSpacing: '0.04em', color: 'var(--color-text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
              VENUE DETAILS
            </h3>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {locationText}
            </p>
          </div>
        </div>

        {/* Map iframe */}
        <a 
          href="https://maps.app.goo.gl/jS54o8EKGNT7gRHS6"
          target="_blank"
          rel="noopener noreferrer"
          className="comic-border-thick overflow-hidden min-h-[350px] relative block cursor-pointer group"
          title="Click to open in Google Maps"
        >
          <iframe
            title="SVKM's Shri Bhagubhai Mafatlal Polytechnic Map"
            src="https://maps.google.com/maps?q=SVKM's%20Shri%20Bhagubhai%20Mafatlal%20Polytechnic&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, pointerEvents: 'none' }}
            allowFullScreen
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold uppercase tracking-wider text-sm pointer-events-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Open in Google Maps ↗
          </div>
        </a>
      </div>
    </main>
  );
}

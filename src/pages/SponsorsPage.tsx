import React, { useEffect } from 'react';
import { playSynthSound } from '../lib/audio';

type Sponsor = {
  name: string;
  icon: string;
  tier: string;
};

const SPONSORS_DATA: Sponsor[] = [
  { name: "TECH BYTE", icon: "</>", tier: "Gold Sponsor" },
  { name: "DEVFOLIO", icon: "{ }", tier: "Gold Sponsor" },
  { name: "PIXEL LABS", icon: "👾", tier: "Silver Sponsor" },
  { name: "CODE CRAFTERS", icon: "C", tier: "Silver Sponsor" },
  { name: "GEEK BEAR", icon: "👓", tier: "Merch Partner" }
];

export function SponsorsPage() {
  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-8 page-content flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="highlight-icon"><i data-lucide="handshake"></i></span>
          <div className="section-divider" style={{ margin: 0 }}>OUR SPONSORS</div>
        </div>
        <p className="text-small text-text-secondary">Powered by amazing partners.</p>
      </div>

      {/* Sponsors List */}
      <div className="flex flex-col gap-4">
        {SPONSORS_DATA.map((sponsor, idx) => (
          <div
            key={idx}
            className="pixel-card flex justify-between items-center p-4 bg-bg-raised border border-border"
          >
            <div className="flex items-center gap-4">
              <span className="font-pixel text-lg text-text-primary shrink-0 w-8 text-center">{sponsor.icon}</span>
              <div>
                <span className="font-ui text-base font-bold text-text-primary uppercase block">{sponsor.name}</span>
                <span className="text-[10px] text-text-secondary uppercase">{sponsor.tier}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Want to sponsor block */}
      <div className="pixel-card text-center flex flex-col gap-4 mt-4">
        <h4 className="font-ui text-base font-bold text-text-primary uppercase">Want to sponsor Spectrum 5.0?</h4>
        <p className="text-small text-text-secondary">Let's build something epic together.</p>
        <a
          href="mailto:sponsor@spectrum.com"
          onClick={() => playSynthSound('click')}
          className="btn btn-accent w-full"
        >
          CONTACT US →
        </a>
      </div>

    </div>
  );
}

import React from 'react';
import { Trophy, Shield } from 'lucide-react';

// Inline SVG Castle Silhouette
export function CastleSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} fill="currentColor">
      {/* Left Outer Tower */}
      <rect x="10" y="30" width="10" height="50" fill="var(--border)" />
      <rect x="8" y="25" width="14" height="5" fill="var(--border)" />
      <rect x="8" y="20" width="4" height="5" fill="var(--border)" />
      <rect x="18" y="20" width="4" height="5" fill="var(--border)" />
      
      {/* Left Wall */}
      <rect x="20" y="45" width="20" height="35" fill="var(--border)" />
      <rect x="25" y="40" width="10" height="5" fill="var(--border)" />
      
      {/* Central Keep */}
      <rect x="40" y="15" width="40" height="65" fill="var(--border)" />
      <rect x="38" y="10" width="8" height="5" fill="var(--border)" />
      <rect x="50" y="10" width="8" height="5" fill="var(--border)" />
      <rect x="62" y="10" width="8" height="5" fill="var(--border)" />
      <rect x="74" y="10" width="8" height="5" fill="var(--border)" />
      {/* Gate */}
      <rect x="52" y="55" width="16" height="25" fill="var(--bg-primary)" />
      <rect x="56" y="50" width="8" height="5" fill="var(--bg-primary)" />
      
      {/* Right Wall */}
      <rect x="80" y="45" width="20" height="35" fill="var(--border)" />
      <rect x="85" y="40" width="10" height="5" fill="var(--border)" />
      
      {/* Right Outer Tower */}
      <rect x="100" y="30" width="10" height="50" fill="var(--border)" />
      <rect x="98" y="25" width="14" height="5" fill="var(--border)" />
      <rect x="98" y="20" width="4" height="5" fill="var(--border)" />
      <rect x="108" y="20" width="4" height="5" fill="var(--border)" />
    </svg>
  );
}

// Inline SVG City Skyline
export function SkylineSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 80" className={className} fill="currentColor">
      <rect x="0" y="50" width="15" height="30" fill="var(--border)" />
      <rect x="10" y="35" width="20" height="45" fill="var(--border)" />
      <rect x="25" y="20" width="25" height="60" fill="var(--border)" />
      <rect x="35" y="10" width="2" height="10" fill="var(--border)" />
      <rect x="50" y="45" width="15" height="35" fill="var(--border)" />
      <rect x="60" y="30" width="30" height="50" fill="var(--border)" />
      <rect x="90" y="55" width="20" height="25" fill="var(--border)" />
      <rect x="105" y="25" width="25" height="55" fill="var(--border)" />
      <rect x="117" y="15" width="2" height="10" fill="var(--border)" />
      <rect x="130" y="40" width="15" height="40" fill="var(--border)" />
      <rect x="140" y="50" width="20" height="30" fill="var(--border)" />
    </svg>
  );
}

// Characters mapping to the png assets in public/
export function CoderCharacter({ className }: { className?: string }) {
  return (
    <img
      src="/Green.png"
      alt="Coder"
      className={className}
      style={{ objectFit: 'contain', width: '100%', height: '100%' }}
    />
  );
}

export function GamerCharacter({ className }: { className?: string }) {
  return (
    <img
      src="/purple.png"
      alt="Gamer"
      className={className}
      style={{ objectFit: 'contain', width: '100%', height: '100%' }}
    />
  );
}

export function AdventureCharacter({ className }: { className?: string }) {
  return (
    <img
      src="/blue.png"
      alt="Adventure"
      className={className}
      style={{ objectFit: 'contain', width: '100%', height: '100%' }}
    />
  );
}

// Extra character if needed (orange.png)
export function SquadCharacter({ className }: { className?: string }) {
  return (
    <img
      src="/orange.png"
      alt="Squad"
      className={className}
      style={{ objectFit: 'contain', width: '100%', height: '100%' }}
    />
  );
}

// Closed Chest
export function ChestClosedSVG({ className }: { className?: string }) {
  return <Shield className={className} />;
}

// Open Chest
export function ChestOpenSVG({ className }: { className?: string }) {
  return <Shield className={className} />;
}

// Trophy (Uses Lucide)
export function TrophySVG({ className }: { className?: string }) {
  return <Trophy className={className} />;
}

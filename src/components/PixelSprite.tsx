import React, { useEffect, useMemo, useRef } from 'react';

const SIZE_CONFIG = {
  lg: { cellPx: 8, cols: 32, rows: 40 },
  md: { cellPx: 5, cols: 32, rows: 40 },
  sm: { cellPx: 5, cols: 16, rows: 20 },
} as const;

export type SpriteSize = 'lg' | 'md' | 'sm';
export type SpriteState = 'outline' | 'colored' | 'static-colored';

interface IdleCell {
  row: number;
  col: number;
}

interface PixelSpriteProps {
  map: string[][];
  palette: Record<string, string>;
  celebrateMap?: string[][];
  size: SpriteSize;
  state: SpriteState;
  animate?: boolean;
  idleRegion?: IdleCell[];
  celebrating?: boolean;
  className?: string;
}

/**
 * PixelSprite — Canvas-based renderer
 * 
 * Draws the character pixel-by-pixel onto a single <canvas>.
 * This completely avoids browser layout/rounding grid gaps, removes
 * any thick black lines from global div borders, and yields massive performance boosts.
 */
export const PixelSprite = React.memo(function PixelSprite({
  map,
  palette,
  celebrateMap,
  size,
  state,
  animate = false,
  idleRegion = [],
  celebrating = false,
  className = '',
}: PixelSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cellPx, cols, rows } = SIZE_CONFIG[size];

  const activeMap = celebrating && celebrateMap ? celebrateMap : map;

  const prefersReduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Animation ticks/bob
  const [bobOffset, setBobOffset] = React.useState(0);
  useEffect(() => {
    if (!animate || prefersReduced || idleRegion.length === 0) {
      setBobOffset(0);
      return;
    }
    // Simple 2.5s bounce
    let active = true;
    const start = Date.now();
    const tick = () => {
      if (!active) return;
      const elapsed = Date.now() - start;
      // alternate between 0 and -1
      const cycle = Math.sin((elapsed / 2500) * Math.PI * 2);
      setBobOffset(cycle > 0 ? 0 : -1);
      requestAnimationFrame(tick);
    };
    tick();
    return () => {
      active = false;
    };
  }, [animate, prefersReduced, idleRegion]);

  // Color stagger progress (colored state only)
  const [staggerProgress, setStaggerProgress] = React.useState(rows);
  useEffect(() => {
    if (state === 'static-colored') {
      setStaggerProgress(rows);
      return;
    }
    if (state === 'outline') {
      setStaggerProgress(0);
      return;
    }
    if (state === 'colored') {
      if (prefersReduced) {
        setStaggerProgress(rows);
        return;
      }
      setStaggerProgress(0);
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setStaggerProgress(current);
        if (current >= rows) clearInterval(interval);
      }, 4);
      return () => clearInterval(interval);
    }
  }, [state, rows, prefersReduced]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, cols * cellPx, rows * cellPx);

    // Get current outline colors
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    const outlineColor = isLightMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';

    for (let r = 0; r < rows; r++) {
      const rowArr = activeMap[r];
      if (!rowArr) continue;

      for (let c = 0; c < cols; c++) {
        const key = rowArr[c];
        if (!key || key === '.') continue;

        // Determine if this cell is part of the animated idle region
        const isIdleCell = animate && !prefersReduced && idleRegion.some(
          cell => cell.row === r && cell.col === c
        );

        // Determine target color based on current stagger / state
        let color = outlineColor;
        if (state === 'static-colored' || r < staggerProgress) {
          color = palette[key] ?? outlineColor;
        }

        // Apply idle bob offset
        const yOffset = isIdleCell ? bobOffset * cellPx : 0;

        ctx.fillStyle = color;
        // Draw pixel block (clean filled rectangle, no borders or gaps)
        ctx.fillRect(c * cellPx, r * cellPx + yOffset, cellPx, cellPx);
      }
    }
  }, [activeMap, palette, state, staggerProgress, bobOffset, animate, idleRegion, cellPx, cols, rows, prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      className={`pixel-sprite ${className}`}
      width={cols * cellPx}
      height={rows * cellPx}
      style={{
        width: cols * cellPx,
        height: rows * cellPx,
        display: 'block',
        imageRendering: 'pixelated',
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
});

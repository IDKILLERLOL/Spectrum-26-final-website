import { useEffect, useRef } from 'react';
import { getTheme } from '../lib/theme';

interface SpeedLine {
  angle: number;
  length: number;
  speed: number;
  radius: number;
  width: number;
}

/**
 * Mouse-reactive rotating speed lines canvas overlay.
 * Matches the Radiant Crisis 001 reference HTML exactly.
 */
export function SpeedLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const frameRef = useRef<number>(0);
  const linesRef = useRef<SpeedLine[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Generate 45 speed lines
    linesRef.current = Array.from({ length: 45 }, () => ({
      angle: Math.random() * Math.PI * 2,
      length: Math.random() * 140 + 60,
      speed: Math.random() * 0.04 + 0.01,
      radius: Math.random() * 350 + 150,
      width: Math.random() * 2.5 + 1,
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const theme = getTheme();
      ctx.strokeStyle =
        theme === 'dark'
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(0,0,0,0.05)';

      const { x: mx, y: my } = mouseRef.current;

      for (const line of linesRef.current) {
        line.angle += line.speed;
        if (line.angle > Math.PI * 2) line.angle = 0;

        const sx = mx + Math.cos(line.angle) * line.radius;
        const sy = my + Math.sin(line.angle) * line.radius;
        const ex = mx + Math.cos(line.angle) * (line.radius + line.length);
        const ey = my + Math.sin(line.angle) * (line.radius + line.length);

        ctx.beginPath();
        ctx.lineWidth = line.width;
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.9,
      }}
    />
  );
}

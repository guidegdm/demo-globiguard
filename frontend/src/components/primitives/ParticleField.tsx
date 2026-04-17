import { useEffect, useRef, useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ─── types ────────────────────────────────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  hue: number;
}

interface ParticleFieldProps {
  width?: number;
  height?: number;
  color?: string;
  density?: 'low' | 'medium' | 'high';
  playing?: boolean;
  className?: string;
}

const DENSITY_COUNT: Record<'low' | 'medium' | 'high', number> = {
  low:    25,
  medium: 55,
  high:  100,
};

/* ─── component ────────────────────────────────────────────────────── */

export function ParticleField({
  width  = 800,
  height = 480,
  color  = '#10B981',
  density = 'medium',
  playing = true,
  className,
}: ParticleFieldProps) {
  const prefersReduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const playRef   = useRef(playing);

  const count = DENSITY_COUNT[density];

  // Parse hex colour to RGB so we can use it with opacity
  const rgb = useMemo(() => {
    const c = color.replace('#', '');
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return `${r},${g},${b}`;
  }, [color]);

  useEffect(() => {
    playRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialise particles
    particles.current = Array.from({ length: count }, () => ({
      x:       Math.random() * width,
      y:       Math.random() * height,
      vx:      (Math.random() - 0.5) * 0.5,
      vy:      (Math.random() - 0.5) * 0.5,
      r:       Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.5 + 0.1,
      hue:     Math.random() * 40 - 20,
    }));

    if (prefersReduced) {
      // Static render only
      ctx.clearRect(0, 0, width, height);
      particles.current.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.opacity * 0.5})`;
        ctx.fill();
      });
      return;
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.current.forEach((p) => {
        if (playRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0)      p.x = width;
          if (p.x > width)  p.x = 0;
          if (p.y < 0)      p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.opacity})`;
        ctx.fill();
      });

      // Draw faint connection lines between nearby particles
      const ps = particles.current;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.12;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(${rgb},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [count, width, height, rgb, prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
}

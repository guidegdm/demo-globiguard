import { useRef, useEffect, useState, type ReactNode } from 'react';

/* ─── useSceneAnimation hook ─────────────────────────────────────── */

export function useSceneAnimation(options?: { once?: boolean; cycleMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [mounted, setMounted] = useState(false);
  const once = options?.once ?? false;
  const cycleMs = options?.cycleMs ?? 90_000;

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = ref.current;
    if (!el) return;
    let triggered = false;
    const obs = new IntersectionObserver(
      ([e]) => {
        const visible = e.isIntersecting;
        if (once && triggered && !visible) return;
        setIsInView(visible);
        if (visible) {
          triggered = true;
          setEpoch((n) => n + 1);
        }
      },
      { rootMargin: '-60px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once, mounted]);

  useEffect(() => {
    if (!isInView || once) return;
    const id = setInterval(() => setEpoch((n) => n + 1), cycleMs);
    return () => clearInterval(id);
  }, [isInView, once, cycleMs]);

  return { ref, isPlaying: isInView, epoch };
}

/* ─── SharedDefs (reusable SVG filter/gradient defs) ─────────────── */

export function SharedDefs() {
  return (
    <defs>
      {/* Linear gradients */}
      <linearGradient id="emeraldGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
      </linearGradient>

      <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
      </linearGradient>

      <linearGradient id="emeraldStroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
      </linearGradient>

      <linearGradient id="cardFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
      </linearGradient>

      {/* NEW: amber gradient for QUEUE state */}
      <linearGradient id="amberGlowGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ED8936" stopOpacity={1} />
        <stop offset="100%" stopColor="#ED8936" stopOpacity={0} />
      </linearGradient>

      {/* NEW: purple gradient for GLiNER detection layer */}
      <linearGradient id="purpleGlowGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6B46C1" stopOpacity={1} />
        <stop offset="100%" stopColor="#6B46C1" stopOpacity={0} />
      </linearGradient>

      {/* NEW: red gradient for BLOCK state */}
      <linearGradient id="redGlowGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E53E3E" stopOpacity={1} />
        <stop offset="100%" stopColor="#E53E3E" stopOpacity={0} />
      </linearGradient>

      {/* Radial gradients */}
      <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
      </radialGradient>

      {/* Filters */}
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <filter id="cardShadow" x="-10%" y="-10%" width="130%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.3" />
      </filter>

      <filter id="heavyGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* NEW: amber glow for QUEUE state */}
      <filter id="amberGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feFlood floodColor="#ED8936" floodOpacity="0.35" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* NEW: purple glow for GLiNER */}
      <filter id="purpleGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feFlood floodColor="#6B46C1" floodOpacity="0.35" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* NEW: red glow for BLOCK state */}
      <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feFlood floodColor="#E53E3E" floodOpacity="0.35" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/* ─── SceneWrapper component ─────────────────────────────────────── */

interface SceneWrapperProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  viewBox?: string;
  className?: string;
  maxWidth?: string;
}

export function SceneWrapper({
  title,
  subtitle,
  children,
  viewBox = '0 0 800 480',
  className,
  maxWidth = 'max-w-5xl',
}: SceneWrapperProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setHeadingVisible(true); },
        { rootMargin: '-60px' },
      );
      obs.observe(el);
      (el as HTMLDivElement & { __obs?: IntersectionObserver }).__obs = obs;
    });
    return () => {
      cancelAnimationFrame(raf);
      (headingRef.current as (HTMLDivElement & { __obs?: IntersectionObserver }) | null)?.__obs?.disconnect();
    };
  }, []);

  return (
    <div className={className}>
      {(title || subtitle) && (
        <div
          ref={headingRef}
          className="mb-8 text-center"
          style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s cubic-bezier(0.21,0.47,0.32,0.98), transform 0.6s cubic-bezier(0.21,0.47,0.32,0.98)',
          }}
        >
          {title && (
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'rgba(255,255,255,0.95)' }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mx-auto mt-2 max-w-lg text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`mx-auto w-full ${maxWidth}`}
        role="img"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        <SharedDefs />
        {children}
      </svg>
    </div>
  );
}

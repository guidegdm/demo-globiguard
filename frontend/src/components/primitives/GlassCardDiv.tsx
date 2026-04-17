import { type ReactNode } from 'react';
import { clsx } from 'clsx';

/* ─── types ────────────────────────────────────────────────────────── */

type CardVariant = 'default' | 'queue' | 'blocked' | 'allowed' | 'highlight';

interface GlassCardDivProps {
  children: ReactNode;
  className?: string;
  accentColor?: string;
  variant?: CardVariant;
  title?: string;
}

/* ─── variant accent colours ─────────────────────────────────────── */

const VARIANT_COLOR: Record<CardVariant, string> = {
  default:   'rgba(16, 185, 129, 0.6)',   /* emerald */
  queue:     'rgba(237, 137, 54, 0.75)',  /* amber */
  blocked:   'rgba(229, 62, 62, 0.75)',   /* red */
  allowed:   'rgba(56, 161, 105, 0.75)',  /* green */
  highlight: 'rgba(99, 102, 241, 0.75)',  /* indigo */
};

/* ─── component ────────────────────────────────────────────────────── */

export function GlassCardDiv({
  children,
  className,
  accentColor,
  variant = 'default',
  title,
}: GlassCardDivProps) {
  const accent = accentColor ?? VARIANT_COLOR[variant];

  return (
    <div
      className={clsx('relative rounded-xl overflow-hidden', className)}
      style={{
        background: 'rgba(15, 17, 23, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />

      {title && (
        <div className="px-4 pt-4 pb-0 text-xs font-semibold uppercase tracking-widest"
          style={{ color: accent }}>
          {title}
        </div>
      )}

      {children}
    </div>
  );
}

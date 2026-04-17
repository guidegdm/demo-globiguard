import { clsx } from 'clsx';

type Decision = 'ALLOW' | 'MODIFY' | 'QUEUE' | 'BLOCK';

const HTTP_CODE: Record<Decision, number> = {
  ALLOW:  200,
  MODIFY: 200,
  QUEUE:  202,
  BLOCK:  403,
};

const CONFIG: Record<Decision, { color: string; bg: string; label: string; icon: string }> = {
  ALLOW:  { color: '#38A169', bg: 'rgba(56,161,105,0.15)',  label: 'ALLOW',  icon: '✓' },
  MODIFY: { color: '#ECC94B', bg: 'rgba(236,201,75,0.15)',  label: 'MODIFY', icon: '≈' },
  QUEUE:  { color: '#ED8936', bg: 'rgba(237,137,54,0.15)',  label: 'QUEUE',  icon: '⏸' },
  BLOCK:  { color: '#E53E3E', bg: 'rgba(229,62,62,0.15)',   label: 'BLOCK',  icon: '✗' },
};

interface DecisionBadgeProps {
  decision: Decision;
  size?: 'sm' | 'md' | 'lg';
  showHttp?: boolean;
}

export function DecisionBadge({ decision, size = 'md', showHttp = false }: DecisionBadgeProps) {
  const { color, bg, label, icon } = CONFIG[decision];
  const http = HTTP_CODE[decision];
  const sizeClass =
    size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' :
    size === 'lg' ? 'text-base px-4 py-2 gap-2' :
    'text-sm px-3 py-1 gap-1.5';

  return (
    <span
      className={clsx('inline-flex items-center font-mono font-bold rounded-full border', sizeClass)}
      style={{ color, background: bg, borderColor: color + '66' }}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
      {showHttp && (
        <span className="opacity-60 text-[0.75em] font-normal">
          {http}
        </span>
      )}
    </span>
  );
}

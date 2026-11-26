import styles from './Progress.module.css';

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

interface ProgressBarProps {
  value: number;
  label: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const v = clamp(value);
  return (
    <div
      className={[styles.bar, className].filter(Boolean).join(' ')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
    >
      <span className={styles.fill} style={{ width: `${v}%` }} />
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  label: string;
  size?: number;
  stroke?: number;
}

/** Кольцо прогресса с процентом в центре. */
export function ProgressRing({ value, label, size = 72, stroke = 8 }: ProgressRingProps) {
  const v = clamp(value);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  return (
    <div className={styles.ring} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
      <svg width={size} height={size} aria-hidden="true">
        <circle className={styles.track} cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className={styles.value}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - v / 100)}
        />
      </svg>
      <span className={styles.ringLabel} style={{ fontSize: Math.round(size * 0.24) }} aria-hidden="true">
        {v}%
      </span>
    </div>
  );
}

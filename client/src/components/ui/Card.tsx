import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

export type CardTone = 'default' | 'soft' | 'tint' | 'dark';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'aside' | 'li';
  tone?: CardTone;
  compact?: boolean;
  children: ReactNode;
}

/** Плитка bento-сетки — базовый контейнер для всех блоков. */
export function Card({ as: Tag = 'div', tone = 'default', compact = false, className, children, ...rest }: CardProps) {
  const cls = [styles.card, tone !== 'default' && styles[tone], compact && styles.compact, className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'warning' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}

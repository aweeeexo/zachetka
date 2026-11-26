import type { ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import type { IconName } from './icons';
import styles from './States.module.css';

interface EmptyStateProps {
  title: string;
  text?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
}

/** Пустой результат: нет данных, ничего не найдено. */
export function EmptyState({ title, text, icon = 'folder', action }: EmptyStateProps) {
  return (
    <div className={styles.state}>
      <span className={styles.icon}>
        <Icon name={icon} size={26} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {text && <p className={styles.text}>{text}</p>}
      {action && <div className={styles.actions}>{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
}

/** Ошибка запроса с кнопкой «Повторить». */
export function ErrorState({ title = 'Не удалось загрузить данные', message, onRetry, action }: ErrorStateProps) {
  return (
    <div className={styles.state} role="alert">
      <span className={`${styles.icon} ${styles.errorIcon}`}>
        <Icon name="alert" size={26} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{message}</p>
      <div className={styles.actions}>
        {onRetry && (
          <Button icon="refresh" onClick={onRetry}>
            Повторить
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}

interface SkeletonProps {
  height?: number;
  count?: number;
  label?: string;
}

/** Заглушки на время загрузки. Для экранных читалок — одно сообщение «Загрузка…». */
export function Skeleton({ height = 72, count = 1, label = 'Загрузка…' }: SkeletonProps) {
  return (
    <div className={styles.skeletonList} role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.skeleton} style={{ height }} aria-hidden="true" />
      ))}
    </div>
  );
}

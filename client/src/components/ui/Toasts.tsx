import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toastDismissed, type Toast } from '../../features/toasts/toastsSlice';
import { Icon } from './Icon';
import styles from './Toasts.module.css';

const AUTO_HIDE_MS = 4500;

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(toastDismissed(toast.id)), AUTO_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={[styles.toast, toast.kind !== 'success' && styles[toast.kind]].filter(Boolean).join(' ')}>
      <Icon name={toast.kind === 'error' ? 'alert' : toast.kind === 'info' ? 'info' : 'checkCircle'} />
      <p className={styles.message}>{toast.message}</p>
      <button type="button" className={styles.close} onClick={() => dispatch(toastDismissed(toast.id))}>
        <Icon name="x" size={16} label="Закрыть уведомление" />
      </button>
    </div>
  );
}

/** Всплывающие уведомления об успехе и ошибках операций (озвучиваются экранными читалками). */
export function Toasts() {
  const toasts = useAppSelector((s) => s.toasts.items);
  return (
    <div className={styles.region} aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

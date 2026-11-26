import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';

interface FieldShellProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  counter?: string;
  children: ReactNode;
}

/** Обёртка поля: подпись, подсказка и ошибка, связанные с контролом через id и aria-describedby. */
function FieldShell({ id, label, hint, error, optional, counter, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {optional && <span className={styles.optional}> (необязательно)</span>}
        </label>
        {counter && <span className={styles.counter}>{counter}</span>}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: ReactNode, error?: string) {
  return [error ? `${id}-error` : hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
}

interface BaseFieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
}

export interface TextFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {}

export function TextField({ label, hint, error, optional, className, ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <input
        id={id}
        className={[styles.control, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </FieldShell>
  );
}

export interface TextAreaFieldProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  /** Показать счётчик символов «n / max». */
  showCount?: boolean;
}

export function TextAreaField({ label, hint, error, optional, showCount, maxLength, value, className, ...rest }: TextAreaFieldProps) {
  const id = useId();
  const length = typeof value === 'string' ? value.length : 0;
  const counter = showCount ? `${length.toLocaleString('ru-RU')}${maxLength ? ` / ${maxLength.toLocaleString('ru-RU')}` : ''}` : undefined;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} counter={counter}>
      <textarea
        id={id}
        className={[styles.control, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        maxLength={maxLength}
        value={value}
        {...rest}
      />
    </FieldShell>
  );
}

export interface SelectFieldProps extends BaseFieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  options: { value: string; label: string }[];
}

export function SelectField({ label, hint, error, optional, options, className, ...rest }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <select
        id={id}
        className={[styles.control, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

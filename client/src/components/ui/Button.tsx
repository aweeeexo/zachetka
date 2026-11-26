import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import styles from './Button.module.css';
import { Icon } from './Icon';
import type { IconName } from './icons';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** Кнопка из одной иконки: текст уходит в aria-label. */
  iconOnly?: boolean;
  children?: ReactNode;
}

export function buttonClassName(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', iconOnly = false, extra?: string) {
  return [styles.button, styles[variant], size === 'sm' && styles.sm, iconOnly && styles.iconOnly, extra]
    .filter(Boolean)
    .join(' ');
}

export interface ButtonProps extends CommonProps, ComponentPropsWithRef<'button'> {
  /** Показывает индикатор и блокирует кнопку, пока идёт запрос. */
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, iconOnly, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {iconOnly ? <span className="visually-hidden">{children}</span> : children}
    </button>
  );
}

export interface ButtonLinkProps extends CommonProps, Omit<LinkProps, 'children'> {}

/** Ссылка, которая выглядит как кнопка (для переходов между страницами). */
export function ButtonLink({ variant = 'primary', size = 'md', icon, iconOnly = false, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClassName(variant, size, iconOnly, className)} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {iconOnly ? <span className="visually-hidden">{children}</span> : children}
    </Link>
  );
}

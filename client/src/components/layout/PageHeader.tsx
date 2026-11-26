import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: ReactNode;
  /** Текст для заголовка вкладки браузера. */
  documentTitle: string;
  subtitle?: ReactNode;
  breadcrumbs?: { to: string; label: string }[];
  actions?: ReactNode;
}

export function PageHeader({ title, documentTitle, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  useEffect(() => {
    document.title = `${documentTitle} — Зачётка`;
  }, [documentTitle]);

  return (
    <div className={styles.header}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Хлебные крошки">
            <ol className={styles.crumbs}>
              {breadcrumbs.map((b) => (
                <li key={b.to}>
                  <Link to={b.to}>{b.label}</Link> /
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

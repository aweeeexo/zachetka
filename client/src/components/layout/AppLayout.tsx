import { Link, NavLink, Outlet } from 'react-router';
import { Icon } from '../ui/Icon';
import type { IconName } from '../ui/icons';
import { Toasts } from '../ui/Toasts';
import styles from './AppLayout.module.css';

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Проекты', icon: 'home', end: true },
  { to: '/new', label: 'Новый проект', icon: 'plus' },
  { to: '/about', label: 'О проекте', icon: 'info' },
];

/** Общий каркас всех страниц: шапка с навигацией, контент, подвал и уведомления. */
export function AppLayout() {
  return (
    <>
      <a className={styles.skip} href="#main">
        Перейти к содержимому
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo} aria-label="Зачётка — мои проекты">
            <span className={styles.logoMark} aria-hidden="true">
              <Icon name="check" size={18} />
            </span>
            <span>Зачётка</span>
          </Link>
          <nav aria-label="Основная навигация">
            <ul className={styles.nav} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => [styles.navLink, isActive && styles.active].filter(Boolean).join(' ')}
                  >
                    <Icon name={item.icon} />
                    <span className={styles.navText}>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Зачётка · MVP (этап 3): данные хранятся в браузере</span>
          <a href="../">Лендинг проекта</a>
        </div>
      </footer>
      <Toasts />
    </>
  );
}

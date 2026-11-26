import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import type { IconName } from '../ui/icons';
import { Toasts } from '../ui/Toasts';
import styles from './AppLayout.module.css';

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Проекты', icon: 'home', end: true },
  { to: '/new', label: 'Новый проект', icon: 'plus' },
  { to: '/about', label: 'О проекте', icon: 'info' },
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'З';
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

/** Общий каркас всех страниц: парящая шапка с навигацией, контент, подвал и уведомления. */
export function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, submitting } = useAppSelector((s) => s.auth);

  async function handleLogout() {
    const action = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(action)) {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">
        Перейти к содержимому
      </a>
      <header className={styles.headerWrap}>
        <div className={styles.headerBar}>
          <Link to={user ? '/' : '/login'} className={styles.logo} aria-label="Зачётка — главная">
            <span className={styles.logoMark} aria-hidden="true">
              <Icon name="check" size={16} />
            </span>
            <span>Зачётка</span>
          </Link>

          <nav aria-label="Основная навигация" className={styles.navWrap}>
            {user ? (
              <ul className={styles.nav}>
                {NAV.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => [styles.navLink, isActive && styles.active].filter(Boolean).join(' ')}
                    >
                      <Icon name={item.icon} size={16} />
                      <span className={styles.navText}>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className={styles.nav}>
                <li>
                  <NavLink
                    to="/about"
                    className={({ isActive }) => [styles.navLink, isActive && styles.active].filter(Boolean).join(' ')}
                  >
                    <Icon name="info" size={16} />
                    <span className={styles.navText}>О проекте</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => [styles.navLink, isActive && styles.active].filter(Boolean).join(' ')}
                  >
                    <Icon name="user" size={16} />
                    <span className={styles.navText}>Войти</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </nav>

          {user && (
            <div className={styles.userArea}>
              <div className={styles.userBadge} title={user.email}>
                <span className={styles.avatar} aria-hidden="true">
                  {initialsOf(user.name)}
                </span>
                <span className={styles.userName}>{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon="logOut"
                loading={submitting}
                onClick={handleLogout}
                aria-label="Выйти из аккаунта"
              >
                <span className={styles.logoutText}>Выйти</span>
              </Button>
            </div>
          )}
        </div>
      </header>
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Зачётка · Frontend MVP (этап 3)</span>
          <a href="../">Лендинг проекта</a>
        </div>
      </footer>
      <Toasts />
    </div>
  );
}

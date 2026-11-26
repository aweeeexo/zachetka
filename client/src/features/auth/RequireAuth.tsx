import { Navigate, Outlet, useLocation } from 'react-router';
import { useAppSelector } from '../../app/hooks';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/States';

/** Защищает внутренние страницы приложения: неавторизованных отправляет на /login. */
export function RequireAuth() {
  const { user, status } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <Card>
        <Skeleton count={3} height={56} label="Проверка сессии…" />
      </Card>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

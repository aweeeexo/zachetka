import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { DEMO_CREDENTIALS } from '../api/mockApi';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { clearAuthError, loginUser } from '../features/auth/authSlice';
import { hasErrors, validateLogin, type FieldErrors } from '../lib/validation';
import fieldStyles from '../components/ui/Field.module.css';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, submitting, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<'email' | 'password'>>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    document.title = 'Вход — Зачётка';
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.password) passwordRef.current?.focus();
      return;
    }
    const action = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(action)) {
      navigate(from, { replace: true });
    }
  }

  async function handleDemoLogin() {
    setErrors({});
    const action = await dispatch(
      loginUser({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password }),
    );
    if (loginUser.fulfilled.match(action)) {
      navigate(from, { replace: true });
    }
  }

  return (
    <div className={styles.shell}>
      <section className={styles.aside} aria-labelledby="auth-hero">
        <span className={styles.kicker}>
          <Icon name="check" size={14} />
          Учебный планировщик
        </span>
        <h1 id="auth-hero" className={styles.headline}>
          Сдавай проекты спокойно и без забытых пунктов
        </h1>
        <p className={styles.lead}>
          Вставь текст длинного задания — Зачётка разложит его на этапы, дедлайны и чек-лист с цитатами из исходника.
        </p>
        <ul className={styles.points}>
          <li className={styles.point}>
            <span className={styles.pointIcon} aria-hidden="true">
              <Icon name="zap" size={14} />
            </span>
            <span>Черновик плана из текста задания с проверкой цитат по номеру строки</span>
          </li>
          <li className={styles.point}>
            <span className={styles.pointIcon} aria-hidden="true">
              <Icon name="checkCircle" size={14} />
            </span>
            <span>Интерактивный чек-лист, приоритеты и экран готовности перед сдачей</span>
          </li>
          <li className={styles.point}>
            <span className={styles.pointIcon} aria-hidden="true">
              <Icon name="file" size={14} />
            </span>
            <span>Экспорт чек-листа в Markdown для README за один клик</span>
          </li>
        </ul>
      </section>

      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Вход в Зачётку</h2>
          <p className={styles.cardSub}>Войдите по email и паролю или откройте готовый демо-аккаунт.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={fieldStyles.field}>
            <label htmlFor="login-email" className={fieldStyles.label}>
              Email
            </label>
            <input
              ref={emailRef}
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="student@shad.ru"
              className={fieldStyles.control}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-err' : undefined}
            />
            {errors.email && (
              <span id="login-email-err" role="alert" className={fieldStyles.error}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={fieldStyles.field}>
            <label htmlFor="login-password" className={fieldStyles.label}>
              Пароль
            </label>
            <div className={styles.passwordWrap}>
              <input
                ref={passwordRef}
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Минимум 6 символов"
                className={fieldStyles.control}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'login-password-err' : undefined}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </div>
            {errors.password && (
              <span id="login-password-err" role="alert" className={fieldStyles.error}>
                {errors.password}
              </span>
            )}
          </div>

          {error && (
            <div role="alert" className={styles.alert}>
              {error}
            </div>
          )}

          <Button type="submit" loading={submitting} className={styles.full}>
            Войти
          </Button>
        </form>

        <div className={styles.divider}>или быстро посмотреть</div>

        <div className={styles.demoBox}>
          <div className={styles.demoMeta}>
            <span>{DEMO_CREDENTIALS.email}</span>
            <span>{DEMO_CREDENTIALS.password}</span>
          </div>
          <Button type="button" variant="secondary" loading={submitting} onClick={handleDemoLogin} className={styles.full}>
            Войти как демо-студент
          </Button>
        </div>

        <p className={styles.switchText}>
          Нет аккаунта? <Link to="/register">Создать аккаунт</Link>
        </p>
      </Card>
    </div>
  );
}

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { clearAuthError, registerUser } from '../features/auth/authSlice';
import { hasErrors, validateRegister, type FieldErrors } from '../lib/validation';
import fieldStyles from '../components/ui/Field.module.css';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, submitting, error } = useAppSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<'name' | 'email' | 'password'>>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Регистрация — Зачётка';
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validateRegister({ name, email, password });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.password) passwordRef.current?.focus();
      return;
    }
    const action = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(action)) {
      navigate('/', { replace: true });
    }
  }

  return (
    <div className={styles.shell}>
      <section className={styles.aside} aria-labelledby="register-hero">
        <span className={styles.kicker}>
          <Icon name="lock" size={14} />
          Локальный аккаунт
        </span>
        <h1 id="register-hero" className={styles.headline}>
          Начни вести учебные проекты по чёткому плану
        </h1>
        <p className={styles.lead}>
          Регистрация сохраняет профиль в браузере (localStorage). На 4-м этапе те же запросы подключатся к серверной базе данных.
        </p>
      </section>

      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Создать аккаунт</h2>
          <p className={styles.cardSub}>Заполните три поля — сразу перейдёте к проектам.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={fieldStyles.field}>
            <label htmlFor="reg-name" className={fieldStyles.label}>
              Имя
            </label>
            <input
              ref={nameRef}
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="Александр"
              className={fieldStyles.control}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'reg-name-err' : undefined}
            />
            {errors.name && (
              <span id="reg-name-err" role="alert" className={fieldStyles.error}>
                {errors.name}
              </span>
            )}
          </div>

          <div className={fieldStyles.field}>
            <label htmlFor="reg-email" className={fieldStyles.label}>
              Email
            </label>
            <input
              ref={emailRef}
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@shad.ru"
              className={fieldStyles.control}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'reg-email-err' : undefined}
            />
            {errors.email && (
              <span id="reg-email-err" role="alert" className={fieldStyles.error}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={fieldStyles.field}>
            <label htmlFor="reg-password" className={fieldStyles.label}>
              Пароль
            </label>
            <div className={styles.passwordWrap}>
              <input
                ref={passwordRef}
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Минимум 6 символов"
                className={fieldStyles.control}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'reg-password-err' : undefined}
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
              <span id="reg-password-err" role="alert" className={fieldStyles.error}>
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
            Зарегистрироваться
          </Button>
        </form>

        <p className={styles.switchText}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </Card>
    </div>
  );
}

// Клиентская валидация форм. Те же правила повторит сервер на этапе 4 (Zod).

import type { DraftStage, LoginInput, RegisterInput } from '../types';

export const LIMITS = {
  titleMin: 3,
  titleMax: 80,
  courseMax: 60,
  sourceMin: 50,
  sourceMax: 50_000,
  requirementMin: 3,
  requirementMax: 300,
  nameMin: 2,
  nameMax: 50,
  passwordMin: 6,
  passwordMax: 64,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginInput): FieldErrors<'email' | 'password'> {
  const errors: FieldErrors<'email' | 'password'> = {};
  const email = values.email.trim();
  if (!email) errors.email = 'Введите email';
  else if (!EMAIL_RE.test(email)) errors.email = 'Введите корректный email';
  if (!values.password) errors.password = 'Введите пароль';
  else if (values.password.length < LIMITS.passwordMin) {
    errors.password = `Минимум ${LIMITS.passwordMin} символов`;
  }
  return errors;
}

export function validateRegister(values: RegisterInput): FieldErrors<'name' | 'email' | 'password'> {
  const errors: FieldErrors<'name' | 'email' | 'password'> = {};
  const name = values.name.trim();
  const email = values.email.trim();
  if (!name) errors.name = 'Введите имя';
  else if (name.length < LIMITS.nameMin) errors.name = `Минимум ${LIMITS.nameMin} символа`;
  else if (name.length > LIMITS.nameMax) errors.name = `Не больше ${LIMITS.nameMax} символов`;
  if (!email) errors.email = 'Введите email';
  else if (!EMAIL_RE.test(email)) errors.email = 'Введите корректный email';
  if (!values.password) errors.password = 'Придумайте пароль';
  else if (values.password.length < LIMITS.passwordMin) {
    errors.password = `Минимум ${LIMITS.passwordMin} символов`;
  } else if (values.password.length > LIMITS.passwordMax) {
    errors.password = `Не больше ${LIMITS.passwordMax} символов`;
  }
  return errors;
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export interface ProjectFormValues {
  title: string;
  course: string;
}

export function validateProjectMeta(values: ProjectFormValues): FieldErrors<'title' | 'course'> {
  const errors: FieldErrors<'title' | 'course'> = {};
  const title = values.title.trim();
  if (!title) errors.title = 'Введите название проекта';
  else if (title.length < LIMITS.titleMin) errors.title = `Минимум ${LIMITS.titleMin} символа`;
  else if (title.length > LIMITS.titleMax) errors.title = `Не больше ${LIMITS.titleMax} символов`;
  if (values.course.trim().length > LIMITS.courseMax) errors.course = `Не больше ${LIMITS.courseMax} символов`;
  return errors;
}

export function validateSourceText(text: string): string | undefined {
  const length = text.trim().length;
  if (length === 0) return 'Вставьте текст задания';
  if (length < LIMITS.sourceMin) return `Слишком коротко: нужно хотя бы ${LIMITS.sourceMin} символов (сейчас ${length})`;
  if (length > LIMITS.sourceMax) return `Слишком длинно: максимум ${LIMITS.sourceMax.toLocaleString('ru-RU')} символов`;
  return undefined;
}

export function validateRequirementText(text: string): string | undefined {
  const length = text.trim().length;
  if (length === 0) return 'Опишите пункт';
  if (length < LIMITS.requirementMin) return `Минимум ${LIMITS.requirementMin} символа`;
  if (length > LIMITS.requirementMax) return `Не больше ${LIMITS.requirementMax} символов`;
  return undefined;
}

export function validateDraft(stages: DraftStage[]): string | undefined {
  if (stages.length === 0 || stages.every((s) => s.requirements.length === 0)) {
    return 'В плане нет ни одного пункта — добавьте пункты в задание или разберите его заново';
  }
  if (stages.some((s) => !s.title.trim())) return 'У каждого этапа должно быть название';
  return undefined;
}

export const hasErrors = (errors: object): boolean => Object.values(errors).some(Boolean);

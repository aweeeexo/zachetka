// Клиентская валидация форм. Те же правила повторит сервер на этапе 4 (Zod).

import type { DraftStage } from '../types';

export const LIMITS = {
  titleMin: 3,
  titleMax: 80,
  courseMax: 60,
  sourceMin: 50,
  sourceMax: 50_000,
  requirementMin: 3,
  requirementMax: 300,
} as const;

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

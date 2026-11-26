import type { Project, Requirement, Stage } from '../types';
import { daysUntil } from './dates';

export interface Progress {
  done: number;
  total: number;
  /** Целое число от 0 до 100. */
  percent: number;
}

export function progressOf(requirements: Requirement[]): Progress {
  const total = requirements.length;
  const done = requirements.filter((r) => r.status === 'done').length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export const stageProgress = (stage: Stage): Progress => progressOf(stage.requirements);

export const projectProgress = (project: Project): Progress =>
  progressOf(project.stages.flatMap((s) => s.requirements));

export function sortedStages(project: Project): Stage[] {
  return [...project.stages].sort((a, b) => a.order - b.order);
}

/**
 * Текущий этап: первый незакрытый этап, срок которого ещё не прошёл.
 * Если таких нет — первый незакрытый, а если всё закрыто — последний.
 */
export function currentStage(project: Project, now: Date = new Date()): Stage | null {
  const stages = sortedStages(project);
  if (stages.length === 0) return null;
  const open = stages.filter((s) => stageProgress(s).percent < 100);
  return (
    open.find((s) => s.deadline !== null && daysUntil(s.deadline, now) >= 0) ??
    open[0] ??
    stages[stages.length - 1]
  );
}

export interface UpcomingDeadline {
  projectId: string;
  projectTitle: string;
  stageId: string;
  stageTitle: string;
  deadline: string;
  remaining: number;
}

/** Ближайшие дедлайны по всем проектам: только незакрытые этапы со сроком не раньше сегодняшнего. */
export function upcomingDeadlines(projects: Project[], now: Date = new Date(), limit = 5): UpcomingDeadline[] {
  return projects
    .flatMap((p) =>
      p.stages
        .filter((s) => s.deadline && daysUntil(s.deadline, now) >= 0 && stageProgress(s).percent < 100)
        .map((s) => ({
          projectId: p.id,
          projectTitle: p.title,
          stageId: s.id,
          stageTitle: s.title,
          deadline: s.deadline as string,
          remaining: s.requirements.filter((r) => r.status === 'todo').length,
        })),
    )
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, limit);
}

/** Незакрытые пункты: сначала обязательные, потом бонусные. */
export function openRequirements(stage: Stage): Requirement[] {
  return stage.requirements
    .filter((r) => r.status === 'todo')
    .sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'required' ? -1 : 1));
}

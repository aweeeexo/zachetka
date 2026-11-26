import { createId } from '../lib/id';
import { parseAssignment } from '../lib/parseAssignment';
import type { NewProjectInput, Project } from '../types';
import { SAMPLE_ASSIGNMENT } from './sampleAssignment';

/** Превращает черновик разбора в проект с id — общая логика для mockApi и демо-данных. */
export function buildProject(input: NewProjectInput, now: Date): Project {
  const timestamp = now.toISOString();
  return {
    id: createId(),
    title: input.title.trim(),
    course: input.course.trim(),
    sourceText: input.sourceText,
    createdAt: timestamp,
    updatedAt: timestamp,
    stages: input.stages.map((stage, index) => ({
      id: createId(),
      title: stage.title.trim(),
      deadline: stage.deadline,
      order: index + 1,
      requirements: stage.requirements.map((r) => ({ ...r, id: createId(), status: 'todo' as const })),
    })),
  };
}

/**
 * Демо-проект из настоящего задания курса: этапы 1–2 уже сданы, этап 3 в работе.
 * Создаётся при первом запуске, чтобы приложение не было пустым.
 */
export function createDemoProject(now: Date = new Date()): Project {
  const parsed = parseAssignment(SAMPLE_ASSIGNMENT, now);
  const project = buildProject(
    { title: 'Итоговый проект', course: 'Веб-разработка, ШАД', sourceText: SAMPLE_ASSIGNMENT, stages: parsed.stages },
    now,
  );
  project.stages.forEach((stage, index) => {
    stage.requirements.forEach((r, i) => {
      if (index < 2 || (index === 2 && i < Math.ceil(stage.requirements.length / 2))) r.status = 'done';
    });
  });
  return project;
}

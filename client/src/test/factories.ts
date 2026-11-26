import type { Project, Requirement, Stage } from '../types';

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

export function makeRequirement(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: nextId('req'),
    text: 'Пункт требования',
    priority: 'required',
    status: 'todo',
    sourceQuote: null,
    sourceLine: null,
    quoteFound: false,
    ...overrides,
  };
}

export function makeStage(overrides: Partial<Stage> = {}): Stage {
  return {
    id: nextId('stage'),
    title: 'Этап',
    deadline: null,
    order: 1,
    requirements: [],
    ...overrides,
  };
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: nextId('project'),
    title: 'Тестовый проект',
    course: 'Курс',
    sourceText: '',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    stages: [],
    ...overrides,
  };
}

// Модель данных (совпадает с презентацией этапа 1): User → Project → Stage → Requirement.

export type Priority = 'required' | 'bonus';
export type RequirementStatus = 'todo' | 'done';
export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface Requirement {
  id: string;
  text: string;
  priority: Priority;
  status: RequirementStatus;
  /** Дословная цитата из исходного задания, на которую опирается пункт. */
  sourceQuote: string | null;
  /** Номер строки в исходном тексте (с 1). */
  sourceLine: number | null;
  /** Цитата действительно найдена в исходном тексте. */
  quoteFound: boolean;
}

export interface Stage {
  id: string;
  title: string;
  /** Дата в формате YYYY-MM-DD или null, если срок не указан. */
  deadline: string | null;
  order: number;
  requirements: Requirement[];
}

export interface Project {
  id: string;
  title: string;
  course: string;
  sourceText: string;
  createdAt: string;
  updatedAt: string;
  stages: Stage[];
}

// ---------- черновик, который возвращает разбор задания ----------

export interface DraftRequirement {
  text: string;
  priority: Priority;
  sourceQuote: string | null;
  sourceLine: number | null;
  quoteFound: boolean;
}

export interface DraftStage {
  title: string;
  deadline: string | null;
  requirements: DraftRequirement[];
}

export interface ParseResult {
  stages: DraftStage[];
  stats: { lines: number; stages: number; requirements: number };
}

// ---------- входные данные операций API ----------

export interface NewProjectInput {
  title: string;
  course: string;
  sourceText: string;
  stages: DraftStage[];
}

export interface ProjectPatch {
  title?: string;
  course?: string;
}

export interface RequirementInput {
  text: string;
  priority: Priority;
}

export type RequirementPatch = Partial<Pick<Requirement, 'text' | 'priority' | 'status'>>;

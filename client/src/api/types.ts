import type {
  LoginInput,
  NewProjectInput,
  ParseResult,
  Project,
  ProjectPatch,
  RegisterInput,
  RequirementInput,
  RequirementPatch,
  User,
} from '../types';

/**
 * Контракт API (совпадает с предварительным REST-контрактом из презентации).
 * На этапе 3 его реализует mockApi (localStorage), на этапе 4 — httpApi (fetch к серверу).
 *
 *   GET    /api/auth/me                      → getCurrentUser
 *   POST   /api/auth/login                   → login
 *   POST   /api/auth/register                → register
 *   POST   /api/auth/logout                  → logout
 *   GET    /api/projects                     → listProjects
 *   GET    /api/projects/:id                 → getProject
 *   POST   /api/projects                     → createProject
 *   PATCH  /api/projects/:id                 → updateProject
 *   DELETE /api/projects/:id                 → deleteProject
 *   POST   /api/stages/:id/requirements      → addRequirement
 *   PATCH  /api/requirements/:id             → updateRequirement
 *   DELETE /api/requirements/:id             → deleteRequirement
 *   POST   /api/parse                        → parseAssignment
 */
export interface Api {
  getCurrentUser(): Promise<User | null>;
  login(input: LoginInput): Promise<User>;
  register(input: RegisterInput): Promise<User>;
  logout(): Promise<void>;
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project>;
  createProject(input: NewProjectInput): Promise<Project>;
  updateProject(id: string, patch: ProjectPatch): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  addRequirement(projectId: string, stageId: string, input: RequirementInput): Promise<Project>;
  updateRequirement(projectId: string, requirementId: string, patch: RequirementPatch): Promise<Project>;
  deleteRequirement(projectId: string, requirementId: string): Promise<Project>;
  parseAssignment(text: string): Promise<ParseResult>;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Достаёт понятное сообщение из любой ошибки. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}

// Моковая реализация API для этапа 3: данные живут в localStorage, ответы приходят
// с задержкой, а в режиме отладки сервер «падает» — чтобы были видны состояния
// загрузки и ошибки. На этапе 4 этот файл заменит httpApi с теми же методами.

import { createId } from '../lib/id';
import { parseAssignment as runParser } from '../lib/parseAssignment';
import {
  validateProjectMeta,
  validateRequirementText,
  validateSourceText,
  validateDraft,
  validateLogin,
  validateRegister,
  hasErrors,
} from '../lib/validation';
import type { LoginInput, NewProjectInput, Project, RegisterInput, Requirement, User } from '../types';
import { buildProject, createDemoProject } from './seed';
import { STORAGE_KEYS, type KeyValueStorage } from './storage';
import { ApiError, type Api } from './types';

interface StoredUser extends User {
  password: string;
}

export const DEMO_CREDENTIALS = {
  email: 'student@shad.ru',
  password: 'zachetka2026',
  name: 'Александр',
} as const;

export interface MockApiOptions {
  storage: KeyValueStorage;
  /** Задержка ответа, мс. В тестах — 0. */
  delayMs?: number;
  now?: () => Date;
  /** Создавать демо-проект при первом запуске. */
  seed?: boolean;
}

/** Глубокая копия ответа — как будто данные пришли по сети. undefined (ответ 204) возвращаем как есть. */
const clone = <T,>(value: T): T => (value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T));

export function createMockApi({ storage, delayMs = 450, now = () => new Date(), seed = true }: MockApiOptions): Api {
  const wait = () => new Promise<void>((resolve) => setTimeout(resolve, delayMs));

  function read(): Project[] {
    const raw = storage.getItem(STORAGE_KEYS.projects);
    if (raw === null) {
      const initial = seed ? [createDemoProject(now())] : [];
      storage.setItem(STORAGE_KEYS.projects, JSON.stringify(initial));
      return initial;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as Project[]) : [];
    } catch {
      return [];
    }
  }

  const write = (projects: Project[]) => storage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));

  /** Общая обёртка: задержка сети + имитация ошибки сервера. */
  async function request<T>(handler: () => T): Promise<T> {
    await wait();
    if (storage.getItem(STORAGE_KEYS.simulateErrors) === '1') {
      throw new ApiError(503, 'Сервер временно недоступен. Проверьте соединение и попробуйте ещё раз.');
    }
    return clone(handler());
  }

  function findProject(projects: Project[], id: string): Project {
    const project = projects.find((p) => p.id === id);
    if (!project) throw new ApiError(404, 'Проект не найден');
    return project;
  }

  function findRequirement(project: Project, requirementId: string): Requirement {
    for (const stage of project.stages) {
      const found = stage.requirements.find((r) => r.id === requirementId);
      if (found) return found;
    }
    throw new ApiError(404, 'Пункт не найден');
  }

  function mutateProject(id: string, change: (project: Project) => void): Project {
    const projects = read();
    const project = findProject(projects, id);
    change(project);
    project.updatedAt = now().toISOString();
    write(projects);
    return project;
  }

  function readUsers(): StoredUser[] {
    const raw = storage.getItem(STORAGE_KEYS.users);
    if (raw === null) {
      const initial: StoredUser[] = [
        {
          id: 'demo-user',
          name: DEMO_CREDENTIALS.name,
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
        },
      ];
      storage.setItem(STORAGE_KEYS.users, JSON.stringify(initial));
      return initial;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
    } catch {
      return [];
    }
  }

  const writeUsers = (users: StoredUser[]) => storage.setItem(STORAGE_KEYS.users, JSON.stringify(users));

  const toPublicUser = ({ id, name, email }: StoredUser): User => ({ id, name, email });

  function readSession(): User | null {
    const raw = storage.getItem(STORAGE_KEYS.session);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<User>;
      if (parsed && typeof parsed.id === 'string' && typeof parsed.email === 'string' && typeof parsed.name === 'string') {
        return { id: parsed.id, name: parsed.name, email: parsed.email };
      }
      return null;
    } catch {
      return null;
    }
  }

  const writeSession = (user: User | null) => {
    if (user) storage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
    else storage.removeItem(STORAGE_KEYS.session);
  };

  return {
    getCurrentUser: async () => clone(readSession()),

    login: (input: LoginInput) =>
      request(() => {
        const errors = validateLogin(input);
        if (hasErrors(errors)) {
          throw new ApiError(400, errors.email ?? errors.password ?? 'Проверьте email и пароль');
        }
        const email = input.email.trim().toLowerCase();
        const found = readUsers().find((u) => u.email.toLowerCase() === email && u.password === input.password);
        if (!found) {
          throw new ApiError(401, 'Неверный email или пароль');
        }
        const publicUser = toPublicUser(found);
        writeSession(publicUser);
        return publicUser;
      }),

    register: (input: RegisterInput) =>
      request(() => {
        const errors = validateRegister(input);
        if (hasErrors(errors)) {
          throw new ApiError(400, errors.name ?? errors.email ?? errors.password ?? 'Ошибка валидации');
        }
        const users = readUsers();
        const email = input.email.trim().toLowerCase();
        if (users.some((u) => u.email.toLowerCase() === email)) {
          throw new ApiError(409, 'Аккаунт с таким email уже существует');
        }
        const created: StoredUser = {
          id: createId(),
          name: input.name.trim(),
          email,
          password: input.password,
        };
        writeUsers([...users, created]);
        const publicUser = toPublicUser(created);
        writeSession(publicUser);
        return publicUser;
      }),

    logout: () =>
      request(() => {
        writeSession(null);
      }),

    listProjects: () => request(() => read()),

    getProject: (id) => request(() => findProject(read(), id)),

    createProject: (input: NewProjectInput) =>
      request(() => {
        const errors = validateProjectMeta(input);
        const sourceError = validateSourceText(input.sourceText);
        const draftError = validateDraft(input.stages);
        if (hasErrors(errors) || sourceError || draftError) {
          throw new ApiError(400, errors.title ?? errors.course ?? sourceError ?? draftError ?? 'Ошибка валидации');
        }
        const project = buildProject(input, now());
        write([project, ...read()]);
        return project;
      }),

    updateProject: (id, patch) =>
      request(() => {
        const current = findProject(read(), id);
        const errors = validateProjectMeta({ title: patch.title ?? current.title, course: patch.course ?? current.course });
        if (hasErrors(errors)) throw new ApiError(400, errors.title ?? errors.course ?? 'Ошибка валидации');
        return mutateProject(id, (p) => {
          if (patch.title !== undefined) p.title = patch.title.trim();
          if (patch.course !== undefined) p.course = patch.course.trim();
        });
      }),

    deleteProject: (id) =>
      request(() => {
        const projects = read();
        findProject(projects, id);
        write(projects.filter((p) => p.id !== id));
      }),

    addRequirement: (projectId, stageId, input) =>
      request(() => {
        const error = validateRequirementText(input.text);
        if (error) throw new ApiError(400, error);
        return mutateProject(projectId, (p) => {
          const stage = p.stages.find((s) => s.id === stageId);
          if (!stage) throw new ApiError(404, 'Этап не найден');
          stage.requirements.push({
            id: createId(),
            text: input.text.trim(),
            priority: input.priority,
            status: 'todo',
            sourceQuote: null,
            sourceLine: null,
            quoteFound: false,
          });
        });
      }),

    updateRequirement: (projectId, requirementId, patch) =>
      request(() => {
        if (patch.text !== undefined) {
          const error = validateRequirementText(patch.text);
          if (error) throw new ApiError(400, error);
        }
        return mutateProject(projectId, (p) => {
          const requirement = findRequirement(p, requirementId);
          if (patch.text !== undefined) requirement.text = patch.text.trim();
          if (patch.priority !== undefined) requirement.priority = patch.priority;
          if (patch.status !== undefined) requirement.status = patch.status;
        });
      }),

    deleteRequirement: (projectId, requirementId) =>
      request(() =>
        mutateProject(projectId, (p) => {
          findRequirement(p, requirementId);
          p.stages.forEach((s) => {
            s.requirements = s.requirements.filter((r) => r.id !== requirementId);
          });
        }),
      ),

    parseAssignment: (text) =>
      request(() => {
        const error = validateSourceText(text);
        if (error) throw new ApiError(400, error);
        return runParser(text, now());
      }),
  };
}

export function setSimulatedErrors(storage: KeyValueStorage, enabled: boolean): void {
  if (enabled) storage.setItem(STORAGE_KEYS.simulateErrors, '1');
  else storage.removeItem(STORAGE_KEYS.simulateErrors);
}

export function resetDemoData(storage: KeyValueStorage): void {
  storage.removeItem(STORAGE_KEYS.projects);
}


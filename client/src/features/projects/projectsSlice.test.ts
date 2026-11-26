import { describe, expect, it } from 'vitest';
import { ApiError, type Api } from '../../api/types';
import { setupStore } from '../../app/store';
import { createTestApi } from '../../test/utils';
import type { NewProjectInput } from '../../types';
import reducer, {
  createProject,
  deleteProject,
  fetchProject,
  fetchProjects,
  initialState,
  toggleRequirement,
} from './projectsSlice';
import { selectFilteredProjects, selectIsBusy, selectProjectById } from './selectors';

const INPUT: NewProjectInput = {
  title: 'Курсовая по вебу',
  course: 'ШАД',
  sourceText: 'Этап 1. Идея. Срок сдачи: 8 октября. Нужно подготовить презентацию и речь.',
  stages: [
    {
      title: 'Идея',
      deadline: '2026-10-08',
      requirements: [
        { text: 'Презентация', priority: 'required', sourceQuote: null, sourceLine: null, quoteFound: false },
        { text: 'Речь на 5 минут', priority: 'required', sourceQuote: null, sourceLine: null, quoteFound: false },
      ],
    },
  ],
};

/** API, у которого падает конкретный метод — чтобы проверить откат и ошибки. */
function failing(api: Api, method: keyof Api, status = 503): Api {
  return { ...api, [method]: () => Promise.reject(new ApiError(status, 'Сервер недоступен')) };
}

async function storeWithProject(api: Api = createTestApi()) {
  const store = setupStore(api);
  const project = await store.dispatch(createProject(INPUT)).unwrap();
  return { store, project, api };
}

describe('projectsSlice: редьюсер', () => {
  it('pending → loading, rejected → failed с текстом ошибки', () => {
    const loading = reducer(initialState, { type: fetchProjects.pending.type });
    expect(loading.listStatus).toBe('loading');

    const failed = reducer(loading, {
      type: fetchProjects.rejected.type,
      payload: { message: 'Сервер недоступен', status: 503 },
      error: {},
    });
    expect(failed.listStatus).toBe('failed');
    expect(failed.listError).toBe('Сервер недоступен');
  });
});

describe('projectsSlice: thunk-и с моковым API', () => {
  it('fetchProjects загружает список', async () => {
    const api = createTestApi();
    await api.createProject(INPUT);
    const store = setupStore(api);

    await store.dispatch(fetchProjects());

    expect(store.getState().projects.listStatus).toBe('succeeded');
    expect(store.getState().projects.items).toHaveLength(1);
  });

  it('fetchProjects сохраняет ошибку сервера', async () => {
    const store = setupStore(failing(createTestApi(), 'listProjects'));
    await store.dispatch(fetchProjects());
    expect(store.getState().projects.listStatus).toBe('failed');
    expect(store.getState().projects.listError).toBe('Сервер недоступен');
  });

  it('fetchProject помечает несуществующий проект как notFound', async () => {
    const store = setupStore(createTestApi());
    await store.dispatch(fetchProject('nope'));
    expect(store.getState().projects.detail.nope).toMatchObject({ status: 'failed', notFound: true });
  });

  it('createProject добавляет проект в стор и сбрасывает черновик разбора', async () => {
    const { store, project } = await storeWithProject();
    expect(selectProjectById(store.getState(), project.id)?.title).toBe('Курсовая по вебу');
    expect(project.stages[0].requirements).toHaveLength(2);
    expect(store.getState().parse.draft).toBeNull();
    expect(store.getState().toasts.items.at(-1)?.kind).toBe('success');
  });

  it('toggleRequirement отмечает пункт и снимает блокировку после ответа', async () => {
    const { store, project } = await storeWithProject();
    const requirementId = project.stages[0].requirements[0].id;

    const promise = store.dispatch(toggleRequirement({ projectId: project.id, requirementId, done: true }));
    // Оптимистично: галочка стоит сразу, пункт помечен как «занятый».
    expect(selectProjectById(store.getState(), project.id)?.stages[0].requirements[0].status).toBe('done');
    expect(selectIsBusy(store.getState(), requirementId)).toBe(true);

    await promise;
    expect(selectIsBusy(store.getState(), requirementId)).toBe(false);
    expect(selectProjectById(store.getState(), project.id)?.stages[0].requirements[0].status).toBe('done');
  });

  it('toggleRequirement откатывает галочку и показывает ошибку, если сервер упал', async () => {
    const api = createTestApi();
    const { project } = await storeWithProject(api);
    const store = setupStore(failing(api, 'updateRequirement'));
    await store.dispatch(fetchProjects());
    const requirementId = project.stages[0].requirements[0].id;

    await store.dispatch(toggleRequirement({ projectId: project.id, requirementId, done: true }));

    expect(selectProjectById(store.getState(), project.id)?.stages[0].requirements[0].status).toBe('todo');
    expect(store.getState().toasts.items.at(-1)).toMatchObject({ kind: 'error', message: 'Сервер недоступен' });
  });

  it('deleteProject убирает проект из списка', async () => {
    const { store, project } = await storeWithProject();
    await store.dispatch(deleteProject({ projectId: project.id }));
    expect(store.getState().projects.items).toHaveLength(0);
  });
});

describe('селекторы', () => {
  it('selectFilteredProjects ищет по названию и курсу без учёта регистра', async () => {
    const { store } = await storeWithProject();
    expect(selectFilteredProjects(store.getState(), 'шад')).toHaveLength(1);
    expect(selectFilteredProjects(store.getState(), 'ВЕБУ')).toHaveLength(1);
    expect(selectFilteredProjects(store.getState(), 'биология')).toHaveLength(0);
  });
});

import { describe, expect, it } from 'vitest';
import { createMockApi, resetDemoData, setSimulatedErrors } from './mockApi';
import { memoryStorage } from './storage';
import { ApiError } from './types';

const make = (seed = false) => {
  const storage = memoryStorage();
  return { storage, api: createMockApi({ storage, delayMs: 0, seed, now: () => new Date(2026, 10, 19) }) };
};

const INPUT = {
  title: 'Проект',
  course: '',
  sourceText: 'x'.repeat(60),
  stages: [
    {
      title: 'Этап',
      deadline: null,
      requirements: [{ text: 'Пункт', priority: 'required' as const, sourceQuote: null, sourceLine: null, quoteFound: false }],
    },
  ],
};

describe('mockApi', () => {
  it('при первом запуске создаёт демо-проект', async () => {
    const { api } = make(true);
    const list = await api.listProjects();
    expect(list).toHaveLength(1);
    expect(list[0].stages.length).toBeGreaterThan(3);
  });

  it('полный CRUD: создать → изменить → добавить пункт → удалить', async () => {
    const { api } = make();
    const project = await api.createProject(INPUT);
    const stageId = project.stages[0].id;

    const renamed = await api.updateProject(project.id, { title: 'Новое имя' });
    expect(renamed.title).toBe('Новое имя');

    const withItem = await api.addRequirement(project.id, stageId, { text: 'Тесты', priority: 'bonus' });
    expect(withItem.stages[0].requirements.map((r) => r.text)).toEqual(['Пункт', 'Тесты']);

    const itemId = withItem.stages[0].requirements[1].id;
    const withoutItem = await api.deleteRequirement(project.id, itemId);
    expect(withoutItem.stages[0].requirements).toHaveLength(1);

    await api.deleteProject(project.id);
    expect(await api.listProjects()).toEqual([]);
  });

  it('данные сохраняются в хранилище между экземплярами API', async () => {
    const { api, storage } = make();
    await api.createProject(INPUT);
    const again = createMockApi({ storage, delayMs: 0 });
    expect(await again.listProjects()).toHaveLength(1);
  });

  it('возвращает копии: изменение ответа не портит «базу»', async () => {
    const { api } = make();
    const project = await api.createProject(INPUT);
    project.title = 'Испорчено';
    expect((await api.getProject(project.id)).title).toBe('Проект');
  });

  it('отвечает 400 на невалидные данные и 404 на неизвестный id', async () => {
    const { api } = make();
    await expect(api.createProject({ ...INPUT, title: 'a' })).rejects.toMatchObject({ status: 400 });
    await expect(api.getProject('nope')).rejects.toMatchObject({ status: 404 });
  });

  it('в режиме отладки имитирует падение сервера (503)', async () => {
    const { api, storage } = make();
    setSimulatedErrors(storage, true);
    const error = await api.listProjects().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(503);

    setSimulatedErrors(storage, false);
    await expect(api.listProjects()).resolves.toEqual([]);
  });

  it('resetDemoData возвращает демо-проект', async () => {
    const { api, storage } = make(true);
    const [demo] = await api.listProjects();
    await api.deleteProject(demo.id);
    resetDemoData(storage);
    expect(await api.listProjects()).toHaveLength(1);
  });
});

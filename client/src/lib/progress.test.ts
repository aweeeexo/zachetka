import { describe, expect, it } from 'vitest';
import { makeProject, makeRequirement, makeStage } from '../test/factories';
import { currentStage, openRequirements, progressOf, projectProgress, upcomingDeadlines } from './progress';

const NOW = new Date(2026, 10, 19);
const done = () => makeRequirement({ status: 'done' });
const todo = () => makeRequirement({ status: 'todo' });

describe('progress', () => {
  it('progressOf считает долю закрытых пунктов', () => {
    expect(progressOf([done(), todo(), todo()])).toEqual({ done: 1, total: 3, percent: 33 });
    expect(progressOf([])).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it('projectProgress суммирует все этапы', () => {
    const project = makeProject({
      stages: [makeStage({ requirements: [done(), done()] }), makeStage({ requirements: [todo(), done()] })],
    });
    expect(projectProgress(project)).toEqual({ done: 3, total: 4, percent: 75 });
  });
});

describe('currentStage', () => {
  it('выбирает первый незакрытый этап, срок которого не прошёл', () => {
    const past = makeStage({ order: 1, deadline: '2026-10-08', requirements: [todo()] });
    const today = makeStage({ order: 2, deadline: '2026-11-19', requirements: [todo()] });
    const later = makeStage({ order: 3, deadline: '2026-12-10', requirements: [todo()] });
    expect(currentStage(makeProject({ stages: [past, today, later] }), NOW)?.id).toBe(today.id);
  });

  it('если всё закрыто — последний этап', () => {
    const a = makeStage({ order: 1, requirements: [done()] });
    const b = makeStage({ order: 2, requirements: [done()] });
    expect(currentStage(makeProject({ stages: [a, b] }), NOW)?.id).toBe(b.id);
  });
});

describe('upcomingDeadlines', () => {
  it('сортирует по дате и пропускает закрытые и прошедшие этапы', () => {
    const p = makeProject({
      title: 'Курсовая',
      stages: [
        makeStage({ title: 'Позже', deadline: '2026-12-10', requirements: [todo(), todo()] }),
        makeStage({ title: 'Сегодня', deadline: '2026-11-19', requirements: [todo()] }),
        makeStage({ title: 'Сдан', deadline: '2026-11-25', requirements: [done()] }),
        makeStage({ title: 'Прошёл', deadline: '2026-10-08', requirements: [todo()] }),
      ],
    });
    const list = upcomingDeadlines([p], NOW);
    expect(list.map((d) => d.stageTitle)).toEqual(['Сегодня', 'Позже']);
    expect(list[1].remaining).toBe(2);
  });
});

describe('openRequirements', () => {
  it('сначала обязательные, потом бонусные; закрытые не попадают', () => {
    const bonus = makeRequirement({ text: 'бонус', priority: 'bonus' });
    const required = makeRequirement({ text: 'обязательно', priority: 'required' });
    const stage = makeStage({ requirements: [bonus, done(), required] });
    expect(openRequirements(stage).map((r) => r.text)).toEqual(['обязательно', 'бонус']);
  });
});

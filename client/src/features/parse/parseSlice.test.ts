import { describe, expect, it } from 'vitest';
import { SAMPLE_ASSIGNMENT } from '../../api/sampleAssignment';
import { setupStore } from '../../app/store';
import { createTestApi } from '../../test/utils';
import { draftRequirementRemoved, draftStageRemoved, draftStageRenamed, parseAssignment } from './parseSlice';

describe('parseSlice', () => {
  it('разбирает задание и кладёт черновик в стор', async () => {
    const store = setupStore(createTestApi());
    await store.dispatch(parseAssignment(SAMPLE_ASSIGNMENT));
    const { status, draft } = store.getState().parse;
    expect(status).toBe('succeeded');
    expect(draft?.stats.stages).toBe(5);
  });

  it('сохраняет ошибку валидации, если текст слишком короткий', async () => {
    const store = setupStore(createTestApi());
    await store.dispatch(parseAssignment('коротко'));
    expect(store.getState().parse.status).toBe('failed');
    expect(store.getState().parse.error).toMatch(/Слишком коротко/);
  });

  it('правки черновика пересчитывают статистику', async () => {
    const store = setupStore(createTestApi());
    await store.dispatch(parseAssignment(SAMPLE_ASSIGNMENT));
    const before = store.getState().parse.draft!;

    store.dispatch(draftStageRenamed({ stageIndex: 0, title: 'Защита идеи' }));
    store.dispatch(draftRequirementRemoved({ stageIndex: 0, requirementIndex: 0 }));
    store.dispatch(draftStageRemoved({ stageIndex: 4 }));

    const after = store.getState().parse.draft!;
    expect(after.stages[0].title).toBe('Защита идеи');
    expect(after.stats.stages).toBe(4);
    expect(after.stats.requirements).toBe(
      before.stats.requirements - 1 - before.stages[4].requirements.length,
    );
  });
});

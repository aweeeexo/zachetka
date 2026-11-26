import { describe, expect, it } from 'vitest';
import { makeProject, makeRequirement, makeStage } from '../test/factories';
import { toMarkdownChecklist } from './markdown';

describe('toMarkdownChecklist', () => {
  const project = makeProject({
    title: 'Итоговый проект',
    stages: [
      makeStage({
        title: 'Защита идеи',
        deadline: '2026-10-08',
        order: 1,
        requirements: [
          makeRequirement({ text: 'Презентация', status: 'done' }),
          makeRequirement({ text: 'AI-функция', priority: 'bonus' }),
        ],
      }),
    ],
  });
  const md = toMarkdownChecklist(project);

  it('содержит заголовок и общий прогресс', () => {
    expect(md.startsWith('# Итоговый проект\n')).toBe(true);
    expect(md).toContain('Готово 1 из 2 (50%)');
  });

  it('выводит этап со сроком и пункты-галочки', () => {
    expect(md).toContain('## Защита идеи — до 8 окт (1/2)');
    expect(md).toContain('- [x] Презентация');
    expect(md).toContain('- [ ] AI-функция _(бонус)_');
  });
});

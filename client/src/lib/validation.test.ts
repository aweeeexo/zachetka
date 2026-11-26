import { describe, expect, it } from 'vitest';
import { validateDraft, validateProjectMeta, validateRequirementText, validateSourceText } from './validation';

describe('validateProjectMeta', () => {
  it('требует название от 3 до 80 символов', () => {
    expect(validateProjectMeta({ title: '', course: '' }).title).toBe('Введите название проекта');
    expect(validateProjectMeta({ title: 'ab', course: '' }).title).toBe('Минимум 3 символа');
    expect(validateProjectMeta({ title: 'x'.repeat(81), course: '' }).title).toBe('Не больше 80 символов');
    expect(validateProjectMeta({ title: 'Курсовая', course: '' })).toEqual({});
  });

  it('ограничивает длину курса', () => {
    expect(validateProjectMeta({ title: 'Курсовая', course: 'к'.repeat(61) }).course).toBe('Не больше 60 символов');
  });
});

describe('validateSourceText', () => {
  it('проверяет наличие и минимальную длину', () => {
    expect(validateSourceText('   ')).toBe('Вставьте текст задания');
    expect(validateSourceText('коротко')).toMatch(/Слишком коротко/);
    expect(validateSourceText('x'.repeat(60))).toBeUndefined();
  });
});

describe('validateRequirementText', () => {
  it('проверяет длину пункта', () => {
    expect(validateRequirementText('')).toBe('Опишите пункт');
    expect(validateRequirementText('ab')).toBe('Минимум 3 символа');
    expect(validateRequirementText('Написать тесты')).toBeUndefined();
  });
});

describe('validateDraft', () => {
  it('не даёт сохранить план без пунктов или с пустым названием этапа', () => {
    expect(validateDraft([])).toMatch(/нет ни одного пункта/);
    const item = { text: 'x', priority: 'required' as const, sourceQuote: null, sourceLine: null, quoteFound: false };
    expect(validateDraft([{ title: ' ', deadline: null, requirements: [item] }])).toBe('У каждого этапа должно быть название');
    expect(validateDraft([{ title: 'Этап', deadline: null, requirements: [item] }])).toBeUndefined();
  });
});

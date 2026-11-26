import { describe, expect, it } from 'vitest';
import { SAMPLE_ASSIGNMENT } from '../api/sampleAssignment';
import { detectPriority, parseAssignment, stripMarkdown, verifyQuote } from './parseAssignment';

const NOW = new Date(2026, 9, 1); // 1 октября 2026

const TEXT = `# Курсовая
## Этапы
### Этап 1. Идея
**Срок сдачи: 8 октября.**
- описание проблемы;
- при необходимости — AI-функция.
### Этап 2. Лендинг
Срок сдачи: 29 октября
1. HTML и CSS без React
## 1. Общее
- README в корне репозитория
## 8. Идеи для проектов
- Каталог фильмов
`;

describe('parseAssignment', () => {
  const result = parseAssignment(TEXT, NOW);

  it('находит этапы и общий раздел', () => {
    expect(result.stages.map((s) => s.title)).toEqual(['Идея', 'Лендинг', 'Общие требования']);
  });

  it('переводит сроки сдачи в даты', () => {
    expect(result.stages.map((s) => s.deadline)).toEqual(['2026-10-08', '2026-10-29', null]);
  });

  it('собирает пункты списков и чистит текст', () => {
    expect(result.stages[0].requirements.map((r) => r.text)).toEqual(['Описание проблемы', 'При необходимости — AI-функция']);
    expect(result.stages[1].requirements[0].text).toBe('HTML и CSS без React');
  });

  it('определяет бонусные пункты', () => {
    expect(result.stages[0].requirements.map((r) => r.priority)).toEqual(['required', 'bonus']);
  });

  it('запоминает строку-источник и проверяет цитату', () => {
    const first = result.stages[0].requirements[0];
    expect(first.sourceLine).toBe(5);
    expect(first.sourceQuote).toBe('описание проблемы;');
    expect(first.quoteFound).toBe(true);
  });

  it('пропускает раздел с идеями проектов', () => {
    const all = result.stages.flatMap((s) => s.requirements.map((r) => r.text));
    expect(all).not.toContain('Каталог фильмов');
    expect(result.stats.requirements).toBe(4);
  });

  it('возвращает пустой план, если в тексте нет пунктов', () => {
    expect(parseAssignment('Просто текст без списков и этапов.', NOW).stages).toHaveLength(0);
  });

  it('разбирает настоящее задание курса: 4 этапа со сроками и общие требования', () => {
    const real = parseAssignment(SAMPLE_ASSIGNMENT, new Date(2026, 10, 19));
    expect(real.stages).toHaveLength(5);
    expect(real.stages.slice(0, 4).map((s) => s.deadline)).toEqual(['2026-10-08', '2026-10-29', '2026-11-19', '2026-12-10']);
    expect(real.stats.requirements).toBeGreaterThan(60);
  });
});

describe('verifyQuote', () => {
  it('находит цитату с точностью до пробелов и регистра', () => {
    expect(verifyQuote('Чистые  HTML,\nCSS и JavaScript', 'чистые html, css')).toBe(true);
  });

  it('не находит выдуманную цитату', () => {
    expect(verifyQuote('Чистые HTML и CSS', 'React и Redux')).toBe(false);
    expect(verifyQuote('текст', null)).toBe(false);
  });
});

describe('вспомогательные функции', () => {
  it('stripMarkdown убирает жирный шрифт, код и ссылки', () => {
    expect(stripMarkdown('**TypeScript.** файл `.env` и [ссылка](https://x.ru)')).toBe('TypeScript. файл .env и ссылка');
  });

  it('detectPriority', () => {
    expect(detectPriority('Наличие ESLint рекомендуется')).toBe('bonus');
    expect(detectPriority('REST API с CRUD')).toBe('required');
  });
});

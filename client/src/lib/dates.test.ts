import { describe, expect, it } from 'vitest';
import { daysUntil, deadlineLabel, deadlineTone, formatShortDate, parseRussianDate } from './dates';

describe('parseRussianDate', () => {
  it('берёт текущий год для ближайших месяцев', () => {
    expect(parseRussianDate(8, 'октября', undefined, new Date(2026, 8, 1))).toBe('2026-10-08');
  });

  it('переносит дату на следующий год, если месяц уже прошёл', () => {
    expect(parseRussianDate(15, 'января', undefined, new Date(2026, 10, 15))).toBe('2027-01-15');
  });

  it('учитывает явно указанный год', () => {
    expect(parseRussianDate(1, 'марта', 2025)).toBe('2025-03-01');
  });

  it('возвращает null для неизвестного месяца и несуществующей даты', () => {
    expect(parseRussianDate(8, 'октябрь')).toBeNull();
    expect(parseRussianDate(31, 'февраля', 2026)).toBeNull();
  });
});

describe('форматирование и дедлайны', () => {
  const NOW = new Date(2026, 10, 19); // 19 ноября 2026

  it('formatShortDate', () => {
    expect(formatShortDate('2026-11-19')).toBe('19 нояб');
    expect(formatShortDate('2026-10-08')).toBe('8 окт');
  });

  it('daysUntil считает полные дни', () => {
    expect(daysUntil('2026-11-19', NOW)).toBe(0);
    expect(daysUntil('2026-12-10', NOW)).toBe(21);
    expect(daysUntil('2026-11-18', NOW)).toBe(-1);
  });

  it('deadlineTone', () => {
    expect(deadlineTone('2026-11-18', NOW)).toBe('overdue');
    expect(deadlineTone('2026-11-19', NOW)).toBe('today');
    expect(deadlineTone('2026-11-21', NOW)).toBe('soon');
    expect(deadlineTone('2026-12-10', NOW)).toBe('later');
    expect(deadlineTone(null, NOW)).toBe('none');
  });

  it('deadlineLabel', () => {
    expect(deadlineLabel('2026-11-19', NOW)).toBe('19 нояб · сегодня');
    expect(deadlineLabel('2026-11-20', NOW)).toBe('20 нояб · завтра');
    expect(deadlineLabel(null, NOW)).toBe('без срока');
  });
});

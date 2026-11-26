// Работа с датами дедлайнов. Даты храним строкой YYYY-MM-DD (без времени и часового пояса).

const MONTHS_GENITIVE: Record<string, number> = {
  января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
  июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
};

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'нояб', 'дек'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Дата в формате YYYY-MM-DD по локальному времени. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isValidDay(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/**
 * «8 октября» → '2026-10-08'. Если год не указан, выбираем ближайший к опорной дате:
 * учебные задания обычно описывают сроки на ближайшие месяцы, поэтому дата
 * берётся из окна «4 месяца назад … 8 месяцев вперёд».
 */
export function parseRussianDate(day: number, monthWord: string, year?: number, now: Date = new Date()): string | null {
  const month = MONTHS_GENITIVE[monthWord.toLowerCase()];
  if (!month || day < 1 || day > 31) return null;

  if (year) return isValidDay(year, month, day) ? `${year}-${pad(month)}-${pad(day)}` : null;

  const base = now.getFullYear();
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 4, 1);
  for (const candidate of [base, base + 1, base - 1]) {
    const date = new Date(candidate, month - 1, day);
    const monthsAhead = (candidate - now.getFullYear()) * 12 + (month - 1 - now.getMonth());
    if (date >= windowStart && monthsAhead <= 8 && isValidDay(candidate, month, day)) {
      return `${candidate}-${pad(month)}-${pad(day)}`;
    }
  }
  return isValidDay(base, month, day) ? `${base}-${pad(month)}-${pad(day)}` : null;
}

/** '2026-10-08' → '8 окт' */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

/** Сколько полных дней от сегодня до даты (отрицательное — срок прошёл). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const [y, m, d] = iso.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

export type DeadlineTone = 'overdue' | 'today' | 'soon' | 'later' | 'none';

export function deadlineTone(iso: string | null, now: Date = new Date()): DeadlineTone {
  if (!iso) return 'none';
  const days = daysUntil(iso, now);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  return 'later';
}

/** Человекочитаемая подпись к дедлайну: «сегодня», «через 3 дн.», «прошёл». */
export function deadlineLabel(iso: string | null, now: Date = new Date()): string {
  if (!iso) return 'без срока';
  const days = daysUntil(iso, now);
  if (days < 0) return `${formatShortDate(iso)} · прошёл`;
  if (days === 0) return `${formatShortDate(iso)} · сегодня`;
  if (days === 1) return `${formatShortDate(iso)} · завтра`;
  return `${formatShortDate(iso)} · через ${days} дн.`;
}

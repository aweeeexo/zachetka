// Разбор текста задания на этапы, сроки и пункты.
// На этапе 3 это детерминированный разбор на регулярных выражениях — он же станет
// бейзлайном для AI-разбора на этапе 4 (см. слайд «Как мерим качество AI»).

import type { DraftRequirement, DraftStage, ParseResult, Priority } from '../types';
import { parseRussianDate } from './dates';

const STAGE_HEADING = /^#{0,6}\s*этап\s+(\d+)\s*[.:)\-—]?\s*(.*)$/i;
const ANY_HEADING = /^(#{1,6})\s+(.*)$/;
const DEADLINE = /срок(?:\s+сдачи)?\s*[:—-]?\s*(\d{1,2})\s+([а-яё]+)(?:\s+(\d{4}))?/i;
const BULLET = /^(?:[-*•–]|\d+[.)])\s+(.+)$/;
const BONUS_HINT = /при необходимости|рекомендуется|желательно|по желанию|дополнительн|бонус/i;
/** Разделы, пункты которых — не требования к сдаче: идеи проектов, варианты на выбор, критерии оценки. */
const SKIP_SECTION = /иде[яи]\s+для\s+проект|повышенной\s+сложности|критерии\s+оценки|рекомендуемый\s+объ[её]м/i;

const MAX_REQUIREMENT_LENGTH = 300;

/** Убирает markdown-разметку, оставляя текст. */
export function stripMarkdown(line: string): string {
  return line
    .replace(/\*\*|__/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Проверяет, что цитата дословно (с точностью до пробелов и регистра) встречается в исходнике. */
export function verifyQuote(sourceText: string, quote: string | null): boolean {
  if (!quote) return false;
  const q = normalize(stripMarkdown(quote));
  return q.length > 0 && normalize(stripMarkdown(sourceText)).includes(q);
}

export function detectPriority(text: string): Priority {
  return BONUS_HINT.test(text) ? 'bonus' : 'required';
}

function cleanRequirement(text: string): string {
  const cleaned = stripMarkdown(text).replace(/[;.,]+$/, '').trim();
  const sentence = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return sentence.length > MAX_REQUIREMENT_LENGTH ? `${sentence.slice(0, MAX_REQUIREMENT_LENGTH - 1)}…` : sentence;
}

export function parseAssignment(text: string, now: Date = new Date()): ParseResult {
  const lines = text.split(/\r?\n/);
  const stages: DraftStage[] = [];
  let current: DraftStage | null = null;
  let general: DraftStage | null = null;
  let skipping = false;

  const target = (): DraftStage => {
    if (current) return current;
    if (!general) general = { title: 'Общие требования', deadline: null, requirements: [] };
    return general;
  };

  lines.forEach((raw, index) => {
    const line = stripMarkdown(raw);
    if (!line || line.startsWith('|') || line.startsWith('>')) return;

    const stage = line.match(STAGE_HEADING);
    if (stage && (raw.trim().startsWith('#') || /^этап/i.test(line))) {
      const title = stage[2].replace(/[.:]+$/, '').trim();
      current = { title: title || `Этап ${stage[1]}`, deadline: null, requirements: [] };
      stages.push(current);
      skipping = false;
      return;
    }

    const heading = raw.trim().match(ANY_HEADING);
    if (heading) {
      // Заголовок верхнего уровня (# или ##) закрывает текущий этап: дальше идут общие требования.
      if (heading[1].length <= 2) current = null;
      skipping = SKIP_SECTION.test(heading[2]);
      return;
    }

    if (skipping) return;

    const deadline = line.match(DEADLINE);
    if (deadline && current) {
      current.deadline = parseRussianDate(Number(deadline[1]), deadline[2], deadline[3] ? Number(deadline[3]) : undefined, now);
      return;
    }

    const bullet = raw.trim().match(BULLET);
    if (bullet) {
      const quote = stripMarkdown(bullet[1]);
      const item: DraftRequirement = {
        text: cleanRequirement(bullet[1]),
        priority: detectPriority(quote),
        sourceQuote: quote,
        sourceLine: index + 1,
        quoteFound: verifyQuote(text, quote),
      };
      if (item.text.length >= 3) target().requirements.push(item);
    }
  });

  if (general) stages.push(general);
  const result = stages.filter((s) => s.requirements.length > 0);
  return {
    stages: result,
    stats: {
      lines: lines.length,
      stages: result.length,
      requirements: result.reduce((sum, s) => sum + s.requirements.length, 0),
    },
  };
}

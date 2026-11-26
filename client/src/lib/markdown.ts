import type { Project } from '../types';
import { formatShortDate } from './dates';
import { projectProgress, sortedStages, stageProgress } from './progress';

/** Чек-лист проекта в Markdown — его удобно вставить в README репозитория. */
export function toMarkdownChecklist(project: Project): string {
  const total = projectProgress(project);
  const lines: string[] = [
    `# ${project.title}`,
    '',
    `Готово ${total.done} из ${total.total} (${total.percent}%)`,
  ];

  for (const stage of sortedStages(project)) {
    const p = stageProgress(stage);
    const due = stage.deadline ? ` — до ${formatShortDate(stage.deadline)}` : '';
    lines.push('', `## ${stage.title}${due} (${p.done}/${p.total})`, '');
    for (const r of stage.requirements) {
      lines.push(`- [${r.status === 'done' ? 'x' : ' '}] ${r.text}${r.priority === 'bonus' ? ' _(бонус)_' : ''}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

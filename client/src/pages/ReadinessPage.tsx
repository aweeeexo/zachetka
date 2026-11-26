import { useId, useState } from 'react';
import { useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { DeadlineBadge } from '../components/project/DeadlineBadge';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Card';
import { ProgressBar, ProgressRing } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/States';
import { toggleRequirement } from '../features/projects/projectsSlice';
import { useProject } from '../features/projects/useProject';
import { toastShown } from '../features/toasts/toastsSlice';
import { toMarkdownChecklist } from '../lib/markdown';
import { currentStage, openRequirements, sortedStages, stageProgress } from '../lib/progress';
import type { Requirement } from '../types';
import styles from './Pages.module.css';
import { ProjectStatus } from './ProjectStatus';

function OpenItem({ requirement, busy, onToggle }: { requirement: Requirement; busy: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <li className={styles.openItem}>
      <input id={id} type="checkbox" checked={false} disabled={busy} onChange={onToggle} />
      <label htmlFor={id}>{requirement.text}</label>
      <Badge tone={requirement.priority === 'bonus' ? 'warning' : 'accent'}>
        {requirement.priority === 'bonus' ? 'Бонус' : 'Обязательно'}
      </Badge>
    </li>
  );
}

/** Сценарий 3: подготовка к сдаче — что ещё не закрыто и экспорт чек-листа в Markdown. */
export function ReadinessPage() {
  const { projectId } = useParams();
  const { project, detail, retry } = useProject(projectId);
  const dispatch = useAppDispatch();
  const pending = useAppSelector((s) => s.projects.pending);
  const [stageId, setStageId] = useState<string | null>(null);

  if (!project) {
    return (
      <>
        <PageHeader title="Готовность к сдаче" documentTitle="Готовность" breadcrumbs={[{ to: '/', label: 'Проекты' }]} />
        <ProjectStatus detail={detail} onRetry={retry} />
      </>
    );
  }

  const stages = sortedStages(project);
  const stage = stages.find((s) => s.id === stageId) ?? currentStage(project);
  const progress = stage ? stageProgress(stage) : { done: 0, total: 0, percent: 0 };
  const open = stage ? openRequirements(stage) : [];
  const markdown = toMarkdownChecklist(project);

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      dispatch(toastShown('success', 'Чек-лист скопирован — вставьте его в README'));
    } catch {
      dispatch(toastShown('error', 'Браузер не дал доступ к буферу обмена. Скачайте файл .md'));
    }
  }

  function downloadMarkdown() {
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project!.title.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase() || 'checklist'}-checklist.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Готовность к сдаче"
        documentTitle={`Готовность — ${project.title}`}
        breadcrumbs={[
          { to: '/', label: 'Проекты' },
          { to: `/projects/${project.id}`, label: project.title },
        ]}
      />

      <div className={styles.stagePicker} role="group" aria-label="Выбор этапа">
        {stages.map((s, i) => (
          <button key={s.id} type="button" className={styles.stageChip} aria-pressed={s.id === stage?.id} onClick={() => setStageId(s.id)}>
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      {stage && (
        <div className={styles.readyGrid}>
          <Card className={styles.ringCard}>
            <ProgressRing value={progress.percent} size={150} stroke={12} label={`Готовность этапа «${stage.title}»`} />
            <h2 className={styles.summaryBig}>{stage.title}</h2>
            <p className={styles.muted}>
              Готово {progress.done} из {progress.total}
            </p>
            <DeadlineBadge deadline={stage.deadline} done={progress.total > 0 && progress.percent === 100} />
            <ul className={styles.stageBars} aria-label="Все этапы">
              {stages.map((s) => {
                const p = stageProgress(s);
                return (
                  <li key={s.id} className={styles.stageBar}>
                    <span className={styles.stageBarHead}>
                      <span>{s.title}</span>
                      <span className={styles.muted}>{p.percent}%</span>
                    </span>
                    <ProgressBar value={p.percent} label={`Этап «${s.title}»`} />
                  </li>
                );
              })}
            </ul>
          </Card>

          <div style={{ display: 'grid', gap: 20 }}>
            <Card as="section" aria-labelledby="open-title">
              <h2 id="open-title" className={styles.sectionTitle}>
                Не закрыто {open.length > 0 && `· ${open.length}`}
              </h2>
              {open.length === 0 ? (
                <EmptyState icon="checkCircle" title="Всё закрыто — можно сдавать!" text="В этом этапе не осталось открытых пунктов." />
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {open.map((r) => (
                    <OpenItem
                      key={r.id}
                      requirement={r}
                      busy={pending.includes(r.id)}
                      onToggle={() => dispatch(toggleRequirement({ projectId: project.id, requirementId: r.id, done: true }))}
                    />
                  ))}
                </ul>
              )}
            </Card>

            <Card as="section" aria-labelledby="export-title" tone="soft">
              <h2 id="export-title" className={styles.sectionTitle}>
                Чек-лист для README
              </h2>
              <p className={styles.muted} style={{ marginBottom: 14 }}>
                Весь проект в формате Markdown: галочки сохранятся и в GitHub.
              </p>
              <div className={styles.actions}>
                <Button icon="copy" onClick={copyMarkdown}>
                  Скопировать
                </Button>
                <Button variant="secondary" icon="download" onClick={downloadMarkdown}>
                  Скачать .md
                </Button>
              </div>
              <details style={{ marginTop: 14 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Предпросмотр</summary>
                <pre className={styles.pre}>{markdown}</pre>
              </details>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

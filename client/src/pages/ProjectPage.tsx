import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { AddRequirementForm } from '../components/project/AddRequirementForm';
import { DeadlineBadge } from '../components/project/DeadlineBadge';
import { ProjectMetaForm } from '../components/project/ProjectMetaForm';
import { RequirementItem } from '../components/project/RequirementItem';
import { SourceCard } from '../components/project/SourceCard';
import { StageTimeline } from '../components/project/StageTimeline';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmButton } from '../components/ui/ConfirmButton';
import { ProgressRing } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/States';
import {
  addRequirement,
  deleteProject,
  deleteRequirement,
  toggleRequirement,
  updateProject,
  updateRequirement,
} from '../features/projects/projectsSlice';
import { useProject } from '../features/projects/useProject';
import { plural } from '../lib/format';
import { currentStage, projectProgress, sortedStages, stageProgress } from '../lib/progress';
import styles from './Pages.module.css';
import { ProjectStatus } from './ProjectStatus';

/** Сценарий 2: ежедневная работа с чек-листом — отметить, добавить, изменить, удалить пункт. */
export function ProjectPage() {
  const { projectId } = useParams();
  const { project, detail, retry } = useProject(projectId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pending = useAppSelector((s) => s.projects.pending);

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  if (!project || !projectId) {
    return (
      <>
        <PageHeader title="Проект" documentTitle="Проект" breadcrumbs={[{ to: '/', label: 'Проекты' }]} />
        <ProjectStatus detail={detail} onRetry={retry} />
      </>
    );
  }

  const stages = sortedStages(project);
  const stage = stages.find((s) => s.id === selectedStageId) ?? currentStage(project);
  const total = projectProgress(project);
  const sourceRequirement = project.stages.flatMap((s) => s.requirements).find((r) => r.id === sourceId) ?? null;

  async function handleDeleteProject() {
    const result = await dispatch(deleteProject({ projectId: projectId as string }));
    if (deleteProject.fulfilled.match(result)) navigate('/');
  }

  return (
    <>
      <PageHeader
        title={project.title}
        documentTitle={project.title}
        breadcrumbs={[{ to: '/', label: 'Проекты' }]}
        subtitle={project.course || undefined}
        actions={
          <>
            <ButtonLink to={`/projects/${project.id}/ready`} icon="checkCircle">
              Готовность к сдаче
            </ButtonLink>
            {!editing && (
              <Button variant="secondary" icon="edit" onClick={() => setEditing(true)}>
                Изменить
              </Button>
            )}
            <ConfirmButton variant="danger" icon="trash" question="Удалить проект?" loading={pending.includes(project.id)} onConfirm={handleDeleteProject}>
              Удалить
            </ConfirmButton>
          </>
        }
      />

      {editing && (
        <Card style={{ marginBottom: 16 }}>
          <ProjectMetaForm
            initial={{ title: project.title, course: project.course }}
            busy={pending.includes(project.id)}
            onCancel={() => setEditing(false)}
            onSave={async (patch) => {
              const result = await dispatch(updateProject({ projectId: project.id, patch }));
              if (updateProject.fulfilled.match(result)) setEditing(false);
            }}
          />
        </Card>
      )}

      <Card className={styles.summary}>
        <ProgressRing value={total.percent} label="Прогресс проекта" />
        <div className={styles.summaryText}>
          <span className={styles.summaryBig}>
            Готово {total.done} из {total.total}
          </span>
          <span className={styles.muted}>
            {stages.length} {plural(stages.length, 'этап', 'этапа', 'этапов')} · текущий: {currentStage(project)?.title ?? '—'}
          </span>
        </div>
      </Card>

      <StageTimeline stages={stages} selectedId={stage?.id ?? null} onSelect={setSelectedStageId} />

      {stage && (
        <div className={styles.projectGrid}>
          <Card as="section" aria-labelledby="stage-title">
            <div className={styles.stageHead}>
              <h2 id="stage-title" className={styles.stageTitle}>
                {stage.title}
              </h2>
              <DeadlineBadge deadline={stage.deadline} done={stageProgress(stage).total > 0 && stageProgress(stage).percent === 100} />
            </div>
            <p className={styles.muted} style={{ marginBottom: 8 }}>
              Закрыто {stageProgress(stage).done} из {stageProgress(stage).total}
            </p>

            {stage.requirements.length === 0 ? (
              <EmptyState icon="flag" title="В этом этапе пока нет пунктов" text="Добавьте первый пункт с помощью формы ниже." />
            ) : (
              <ul className={styles.reqList} aria-label={`Пункты этапа «${stage.title}»`}>
                {stage.requirements.map((r) => (
                  <RequirementItem
                    key={r.id}
                    requirement={r}
                    busy={pending.includes(r.id)}
                    sourceActive={sourceId === r.id}
                    onShowSource={() => setSourceId(sourceId === r.id ? null : r.id)}
                    onToggle={(done) => dispatch(toggleRequirement({ projectId: project.id, requirementId: r.id, done }))}
                    onSave={(patch) => dispatch(updateRequirement({ projectId: project.id, requirementId: r.id, patch }))}
                    onDelete={() => {
                      if (sourceId === r.id) setSourceId(null);
                      void dispatch(deleteRequirement({ projectId: project.id, requirementId: r.id }));
                    }}
                  />
                ))}
              </ul>
            )}

            <hr className={styles.divider} />
            <AddRequirementForm
              key={stage.id}
              stageTitle={stage.title}
              busy={pending.includes(`stage:${stage.id}`)}
              onAdd={async (input) => {
                const result = await dispatch(addRequirement({ projectId: project.id, stageId: stage.id, input }));
                return addRequirement.fulfilled.match(result);
              }}
            />
          </Card>

          <div className={styles.aside}>
            <SourceCard requirement={sourceRequirement} />
          </div>
        </div>
      )}
    </>
  );
}

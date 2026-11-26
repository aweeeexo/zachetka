import { Link } from 'react-router';
import { currentStage, projectProgress, stageProgress } from '../../lib/progress';
import type { Project } from '../../types';
import { Badge, Card } from '../ui/Card';
import { ProgressBar } from '../ui/Progress';
import { DeadlineBadge } from './DeadlineBadge';
import styles from './ProjectCard.module.css';

export function ProjectCard({ project, now }: { project: Project; now?: Date }) {
  const progress = projectProgress(project);
  const stage = currentStage(project, now);
  const stageIndex = stage ? project.stages.findIndex((s) => s.id === stage.id) + 1 : 0;

  return (
    <Card as="article" className={styles.card}>
      <div className={styles.top}>
        {project.course ? <Badge tone="primary">{project.course}</Badge> : <span />}
        {stage && <DeadlineBadge deadline={stage.deadline} now={now} />}
      </div>
      <div>
        <h2 className={styles.title}>
          <Link to={`/projects/${project.id}`} className={styles.link}>
            {project.title}
          </Link>
        </h2>
        {stage && (
          <p className={styles.stage}>
            Этап {stageIndex} из {project.stages.length}: {stage.title} · {stageProgress(stage).done}/{stageProgress(stage).total}
          </p>
        )}
      </div>
      <div className={styles.progressRow}>
        <ProgressBar value={progress.percent} label={`Прогресс проекта «${project.title}»`} />
        <span className={styles.percent}>{progress.percent}%</span>
      </div>
    </Card>
  );
}

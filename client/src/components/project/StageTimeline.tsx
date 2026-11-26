import { stageProgress } from '../../lib/progress';
import type { Stage } from '../../types';
import { Icon } from '../ui/Icon';
import { ProgressBar } from '../ui/Progress';
import { DeadlineBadge } from './DeadlineBadge';
import styles from './StageTimeline.module.css';

interface StageTimelineProps {
  stages: Stage[];
  selectedId: string | null;
  onSelect: (stageId: string) => void;
  now?: Date;
}

/** Шкала этапов. Выбранный этап отмечен aria-pressed — так его состояние слышно экранной читалке. */
export function StageTimeline({ stages, selectedId, onSelect, now }: StageTimelineProps) {
  return (
    <ol className={styles.list} aria-label="Этапы проекта">
      {stages.map((stage, index) => {
        const p = stageProgress(stage);
        const complete = p.total > 0 && p.done === p.total;
        return (
          <li key={stage.id} className={styles.item}>
            <button
              type="button"
              className={[styles.stage, stage.id === selectedId && styles.selected, complete && styles.done]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={stage.id === selectedId}
              onClick={() => onSelect(stage.id)}
            >
              <span className={styles.head}>
                <span className={styles.num} aria-hidden="true">
                  {complete ? <Icon name="check" size={15} /> : index + 1}
                </span>
                <span className={styles.title}>{stage.title}</span>
              </span>
              <span className={styles.meta}>
                <DeadlineBadge deadline={stage.deadline} done={complete} now={now} />
                <span>
                  {p.done}/{p.total}
                </span>
              </span>
              <ProgressBar value={p.percent} label={`Прогресс этапа «${stage.title}»`} />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

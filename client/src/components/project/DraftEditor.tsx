import type { DraftStage } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Card';
import { TextField } from '../ui/Field';
import styles from './DraftEditor.module.css';

interface DraftEditorProps {
  stages: DraftStage[];
  onRenameStage: (stageIndex: number, title: string) => void;
  onChangeDeadline: (stageIndex: number, deadline: string | null) => void;
  onRemoveStage: (stageIndex: number) => void;
  onRemoveRequirement: (stageIndex: number, requirementIndex: number) => void;
}

/** Редактор черновика плана: можно переименовать этап, поправить срок, убрать лишнее. */
export function DraftEditor({ stages, onRenameStage, onChangeDeadline, onRemoveStage, onRemoveRequirement }: DraftEditorProps) {
  return (
    <ol className={styles.stages}>
      {stages.map((stage, si) => (
        <li key={si} className={styles.stage}>
          <div className={styles.stageHead}>
            <TextField
              label={`Этап ${si + 1}`}
              value={stage.title}
              error={stage.title.trim() ? undefined : 'Введите название этапа'}
              onChange={(e) => onRenameStage(si, e.target.value)}
            />
            <TextField
              label="Срок сдачи"
              type="date"
              value={stage.deadline ?? ''}
              onChange={(e) => onChangeDeadline(si, e.target.value || null)}
            />
            <Button variant="ghost" icon="trash" iconOnly onClick={() => onRemoveStage(si)}>
              Убрать этап «{stage.title}»
            </Button>
          </div>
          <ul className={styles.items} aria-label={`Пункты этапа «${stage.title}»`}>
            {stage.requirements.map((r, ri) => (
              <li key={`${r.sourceLine}-${ri}`} className={styles.item}>
                <div className={styles.itemText}>
                  {r.text}
                  <div className={styles.itemMeta}>
                    {r.priority === 'bonus' && <Badge tone="warning">Бонус</Badge>}
                    {r.sourceLine !== null && <span className={styles.line}>стр. {r.sourceLine}</span>}
                    {!r.quoteFound && <Badge tone="danger">цитата не найдена</Badge>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" icon="x" iconOnly onClick={() => onRemoveRequirement(si, ri)}>
                  Убрать пункт «{r.text}»
                </Button>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

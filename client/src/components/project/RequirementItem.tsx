import { useId, useState, type FormEvent } from 'react';
import { validateRequirementText } from '../../lib/validation';
import type { Priority, Requirement, RequirementPatch } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Card';
import { ConfirmButton } from '../ui/ConfirmButton';
import { SelectField, TextField } from '../ui/Field';
import { Icon } from '../ui/Icon';
import styles from './RequirementItem.module.css';

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'required', label: 'Обязательно' },
  { value: 'bonus', label: 'Бонус' },
];

export interface RequirementItemProps {
  requirement: Requirement;
  busy?: boolean;
  sourceActive?: boolean;
  onToggle: (done: boolean) => void;
  onSave: (patch: RequirementPatch) => void;
  onDelete: () => void;
  onShowSource?: () => void;
}

/** Пункт чек-листа: отметить, посмотреть источник, изменить, удалить. */
export function RequirementItem({ requirement, busy, sourceActive, onToggle, onSave, onDelete, onShowSource }: RequirementItemProps) {
  const checkboxId = useId();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(requirement.text);
  const [priority, setPriority] = useState<Priority>(requirement.priority);
  const [error, setError] = useState<string>();
  const done = requirement.status === 'done';

  function startEditing() {
    setText(requirement.text);
    setPriority(requirement.priority);
    setError(undefined);
    setEditing(true);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const message = validateRequirementText(text);
    if (message) {
      setError(message);
      return;
    }
    onSave({ text: text.trim(), priority });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className={styles.item}>
        <form className={styles.editForm} onSubmit={submit} noValidate>
          <TextField
            label="Текст пункта"
            value={text}
            error={error}
            autoFocus
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(undefined);
            }}
            onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
          />
          <div className={styles.editRow}>
            <SelectField
              label="Приоритет"
              value={priority}
              options={PRIORITY_OPTIONS}
              onChange={(e) => setPriority(e.target.value as Priority)}
            />
          </div>
          <div className={styles.editRow}>
            <Button type="submit" size="sm" icon="save">
              Сохранить
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={[styles.item, done && styles.done].filter(Boolean).join(' ')}>
      <input
        id={checkboxId}
        type="checkbox"
        className={styles.checkbox}
        checked={done}
        disabled={busy}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <div className={styles.body}>
        <label htmlFor={checkboxId} className={styles.text}>
          {requirement.text}
        </label>
        <div className={styles.meta}>
          <Badge tone={requirement.priority === 'bonus' ? 'warning' : 'primary'}>
            {requirement.priority === 'bonus' ? 'Бонус' : 'Обязательно'}
          </Badge>
          {requirement.sourceLine !== null && onShowSource && (
            <button
              type="button"
              className={[styles.sourceBtn, sourceActive && styles.sourceActive].filter(Boolean).join(' ')}
              onClick={onShowSource}
              aria-pressed={sourceActive}
            >
              <Icon name="anchor" size={13} />
              стр. {requirement.sourceLine}
            </button>
          )}
          {!requirement.quoteFound && requirement.sourceLine !== null && <Badge tone="danger">проверьте вручную</Badge>}
        </div>
      </div>
      <div className={styles.actions}>
        <Button size="sm" variant="ghost" icon="edit" iconOnly onClick={startEditing} disabled={busy}>
          Изменить пункт «{requirement.text}»
        </Button>
        <ConfirmButton size="sm" variant="ghost" icon="trash" iconOnly question="Удалить?" confirmLabel="Да" onConfirm={onDelete} disabled={busy}>
          Удалить пункт «{requirement.text}»
        </ConfirmButton>
      </div>
    </li>
  );
}

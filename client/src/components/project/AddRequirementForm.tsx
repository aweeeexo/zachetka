import { useState, type FormEvent } from 'react';
import { validateRequirementText } from '../../lib/validation';
import type { Priority, RequirementInput } from '../../types';
import { Button } from '../ui/Button';
import { SelectField, TextField } from '../ui/Field';
import styles from './Forms.module.css';
import { PRIORITY_OPTIONS } from './RequirementItem';

interface AddRequirementFormProps {
  stageTitle: string;
  busy?: boolean;
  /** Возвращает true, если пункт сохранён — тогда форма очищается. */
  onAdd: (input: RequirementInput) => Promise<boolean>;
}

export function AddRequirementForm({ stageTitle, busy, onAdd }: AddRequirementFormProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('required');
  const [error, setError] = useState<string>();
  const [touched, setTouched] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    const message = validateRequirementText(text);
    setError(message);
    if (message) return;
    const ok = await onAdd({ text: text.trim(), priority });
    if (ok) {
      setText('');
      setPriority('required');
      setTouched(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-label={`Добавить пункт в этап «${stageTitle}»`}>
      <div className={styles.row}>
        <TextField
          label="Новый пункт"
          placeholder="Например: написать E2E-тест на создание проекта"
          value={text}
          error={touched ? error : undefined}
          onChange={(e) => {
            setText(e.target.value);
            if (touched) setError(validateRequirementText(e.target.value));
          }}
        />
        <SelectField label="Приоритет" value={priority} options={PRIORITY_OPTIONS} onChange={(e) => setPriority(e.target.value as Priority)} />
      </div>
      <div className={styles.actions}>
        <Button type="submit" icon="plus" loading={busy}>
          Добавить пункт
        </Button>
      </div>
    </form>
  );
}

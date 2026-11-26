import { useState, type FormEvent } from 'react';
import { LIMITS, validateProjectMeta, type FieldErrors, type ProjectFormValues } from '../../lib/validation';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Field';
import styles from './Forms.module.css';

interface ProjectMetaFormProps {
  initial: ProjectFormValues;
  busy?: boolean;
  onSave: (values: ProjectFormValues) => void;
  onCancel: () => void;
}

/** Форма редактирования названия и курса проекта. */
export function ProjectMetaForm({ initial, busy, onSave, onCancel }: ProjectMetaFormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors<'title' | 'course'>>({});

  function update(field: keyof ProjectFormValues, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) setErrors(validateProjectMeta(next));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateProjectMeta(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSave({ title: values.title.trim(), course: values.course.trim() });
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-label="Редактирование проекта">
      <div className={styles.row} style={{ gridTemplateColumns: '1fr 1fr' }}>
        <TextField label="Название" value={values.title} maxLength={LIMITS.titleMax} error={errors.title} onChange={(e) => update('title', e.target.value)} autoFocus />
        <TextField label="Курс" optional value={values.course} maxLength={LIMITS.courseMax} error={errors.course} onChange={(e) => update('course', e.target.value)} />
      </div>
      <div className={styles.actions}>
        <Button type="submit" icon="save" loading={busy}>
          Сохранить
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

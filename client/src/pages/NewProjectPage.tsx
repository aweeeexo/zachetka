import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { SAMPLE_ASSIGNMENT } from '../api/sampleAssignment';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { DraftEditor } from '../components/project/DraftEditor';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Card';
import { TextAreaField, TextField } from '../components/ui/Field';
import { Icon } from '../components/ui/Icon';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States';
import {
  draftDeadlineChanged,
  draftRequirementRemoved,
  draftReset,
  draftStageRemoved,
  draftStageRenamed,
  parseAssignment,
} from '../features/parse/parseSlice';
import { createProject } from '../features/projects/projectsSlice';
import { LIMITS, validateDraft, validateProjectMeta, validateSourceText } from '../lib/validation';
import styles from './Pages.module.css';

type Errors = Partial<Record<'title' | 'course' | 'sourceText', string>>;

function validateAll(values: { title: string; course: string; sourceText: string }): Errors {
  return { ...validateProjectMeta(values), sourceText: validateSourceText(values.sourceText) };
}

/** Сценарий 1: вставить задание → получить черновик → поправить → сохранить проект. */
export function NewProjectPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const parse = useAppSelector((s) => s.parse);

  const [values, setValues] = useState({ title: '', course: '', sourceText: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [parsedText, setParsedText] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftError, setDraftError] = useState<string>();

  function update(field: keyof typeof values, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Ошибку поля перепроверяем на лету, как только пользователь начал её исправлять.
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: validateAll(next)[field] }));
  }

  function focusFirstInvalid() {
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }

  function runParse(e?: FormEvent) {
    e?.preventDefault();
    const found = validateAll(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      focusFirstInvalid();
      return;
    }
    setParsedText(values.sourceText);
    setDraftError(undefined);
    void dispatch(parseAssignment(values.sourceText));
  }

  function fillSample() {
    const next = {
      title: values.title || 'Итоговый проект',
      course: values.course || 'Веб-разработка, ШАД',
      sourceText: SAMPLE_ASSIGNMENT,
    };
    setValues(next);
    setErrors({});
  }

  async function save() {
    const found = validateAll(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      focusFirstInvalid();
      return;
    }
    if (!parse.draft) return;
    const problem = validateDraft(parse.draft.stages);
    setDraftError(problem);
    if (problem) return;

    setSaving(true);
    const result = await dispatch(
      createProject({ title: values.title, course: values.course, sourceText: values.sourceText, stages: parse.draft.stages }),
    );
    setSaving(false);
    if (createProject.fulfilled.match(result)) navigate(`/projects/${result.payload.id}`);
  }

  const draft = parse.draft;
  const textChanged = draft !== null && parsedText !== null && parsedText !== values.sourceText;

  return (
    <>
      <PageHeader
        title="Новый проект"
        documentTitle="Новый проект"
        breadcrumbs={[{ to: '/', label: 'Проекты' }]}
        subtitle="Вставьте текст задания — получите этапы, сроки и чек-лист с цитатами из исходника."
      />

      <div className={styles.newGrid}>
        <Card as="section" aria-labelledby="assignment-title">
          <h2 id="assignment-title" className={styles.sectionTitle}>
            1. Задание
          </h2>
          <form ref={formRef} className={styles.formStack} onSubmit={runParse} noValidate>
            <div className={styles.twoCols}>
              <TextField
                label="Название проекта"
                value={values.title}
                maxLength={LIMITS.titleMax}
                error={errors.title}
                placeholder="Итоговый проект"
                onChange={(e) => update('title', e.target.value)}
                onBlur={() => values.title && setErrors((p) => ({ ...p, title: validateProjectMeta(values).title }))}
              />
              <TextField
                label="Курс"
                optional
                value={values.course}
                maxLength={LIMITS.courseMax}
                error={errors.course}
                placeholder="Веб-разработка"
                onChange={(e) => update('course', e.target.value)}
              />
            </div>
            <TextAreaField
              label="Текст задания"
              rows={14}
              showCount
              maxLength={LIMITS.sourceMax}
              value={values.sourceText}
              error={errors.sourceText}
              hint="Подойдёт Markdown или обычный текст с заголовками «Этап 1», строками «Срок сдачи: …» и списками."
              spellCheck={false}
              onChange={(e) => update('sourceText', e.target.value)}
            />
            <div className={styles.actions}>
              <Button type="submit" icon="zap" loading={parse.status === 'loading'}>
                Разобрать задание
              </Button>
              <Button variant="secondary" icon="file" onClick={fillSample}>
                Вставить пример
              </Button>
            </div>
          </form>
        </Card>

        <Card as="section" tone="soft" aria-labelledby="draft-title" aria-busy={parse.status === 'loading'}>
          <div className={styles.draftHead}>
            <h2 id="draft-title" className={styles.sectionTitle} style={{ margin: 0 }}>
              2. Черновик плана
            </h2>
            {draft && parse.status === 'succeeded' && (
              <div className={styles.chips}>
                <Badge tone="primary">Этапов: {draft.stats.stages}</Badge>
                <Badge tone="primary">Пунктов: {draft.stats.requirements}</Badge>
                <Badge>Строк: {draft.stats.lines}</Badge>
              </div>
            )}
          </div>

          {parse.status === 'idle' && !draft && (
            <EmptyState
              icon="file"
              title="Здесь появится план"
              text="Заполните форму слева и нажмите «Разобрать задание». Нет своего текста — нажмите «Вставить пример»."
            />
          )}

          {parse.status === 'loading' && <Skeleton count={4} height={88} label="Разбираем задание…" />}

          {parse.status === 'failed' && (
            <ErrorState title="Не удалось разобрать задание" message={parse.error ?? ''} onRetry={() => runParse()} />
          )}

          {parse.status === 'succeeded' && draft && draft.stages.length === 0 && (
            <EmptyState
              icon="search"
              title="Не нашли ни этапов, ни пунктов"
              text="Добавьте в текст заголовки вида «Этап 1. …» и пункты списка через «-», затем разберите снова."
            />
          )}

          {parse.status === 'succeeded' && draft && draft.stages.length > 0 && (
            <>
              {textChanged && (
                <p className={styles.notice} role="status">
                  <Icon name="info" /> Текст задания изменился после разбора — разберите его заново, чтобы обновить план.
                </p>
              )}
              <DraftEditor
                stages={draft.stages}
                onRenameStage={(stageIndex, title) => dispatch(draftStageRenamed({ stageIndex, title }))}
                onChangeDeadline={(stageIndex, deadline) => dispatch(draftDeadlineChanged({ stageIndex, deadline }))}
                onRemoveStage={(stageIndex) => dispatch(draftStageRemoved({ stageIndex }))}
                onRemoveRequirement={(stageIndex, requirementIndex) => dispatch(draftRequirementRemoved({ stageIndex, requirementIndex }))}
              />
              {draftError && (
                <p className={styles.formError} role="alert">
                  {draftError}
                </p>
              )}
              <div className={styles.actions} style={{ marginTop: 16 }}>
                <Button icon="save" onClick={save} loading={saving}>
                  Сохранить проект
                </Button>
                <Button variant="ghost" onClick={() => dispatch(draftReset())}>
                  Сбросить черновик
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

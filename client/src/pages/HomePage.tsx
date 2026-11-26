import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { DeadlineBadge } from '../components/project/DeadlineBadge';
import { ProjectCard } from '../components/project/ProjectCard';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/Field';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States';
import { fetchProjects } from '../features/projects/projectsSlice';
import {
  selectFilteredProjects,
  selectListError,
  selectListStatus,
  selectOverallStats,
  selectProjects,
  selectUpcomingDeadlines,
} from '../features/projects/selectors';
import { plural } from '../lib/format';
import styles from './Pages.module.css';

/** Главная: список проектов, поиск и ближайшие дедлайны. */
export function HomePage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectListStatus);
  const error = useAppSelector(selectListError);
  const all = useAppSelector(selectProjects);
  const [query, setQuery] = useState('');
  const projects = useAppSelector((s) => selectFilteredProjects(s, query));
  const upcoming = useAppSelector(selectUpcomingDeadlines);
  const stats = useAppSelector(selectOverallStats);

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchProjects());
  }, [status, dispatch]);

  const subtitle =
    status === 'succeeded' && stats.projects > 0
      ? `${stats.projects} ${plural(stats.projects, 'проект', 'проекта', 'проектов')} · закрыто ${stats.done} из ${stats.total} пунктов`
      : 'Задания, этапы и дедлайны в одном месте';

  return (
    <>
      <PageHeader
        title="Мои проекты"
        documentTitle="Мои проекты"
        subtitle={subtitle}
        actions={
          <ButtonLink to="/new" icon="plus">
            Новый проект
          </ButtonLink>
        }
      />

      {(status === 'idle' || status === 'loading') && <Skeleton count={3} height={150} label="Загружаем проекты…" />}

      {status === 'failed' && (
        <Card>
          <ErrorState title="Не удалось загрузить проекты" message={error ?? ''} onRetry={() => dispatch(fetchProjects())} />
        </Card>
      )}

      {status === 'succeeded' && all.length === 0 && (
        <Card>
          <EmptyState
            title="Пока нет проектов"
            text="Вставьте текст учебного задания — Зачётка разложит его на этапы, сроки и пункты."
            action={
              <ButtonLink to="/new" icon="plus">
                Создать первый проект
              </ButtonLink>
            }
          />
        </Card>
      )}

      {status === 'succeeded' && all.length > 0 && (
        <div className={styles.homeGrid}>
          <section aria-labelledby="projects-title">
            <h2 id="projects-title" className="visually-hidden">
              Список проектов
            </h2>
            <div className={styles.toolbar}>
              <TextField
                label="Поиск по проектам"
                type="search"
                placeholder="Название или курс"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {projects.length === 0 ? (
              <Card>
                <EmptyState
                  icon="search"
                  title="Ничего не найдено"
                  text={`По запросу «${query}» проектов нет.`}
                  action={
                    <Button variant="secondary" onClick={() => setQuery('')}>
                      Сбросить поиск
                    </Button>
                  }
                />
              </Card>
            ) : (
              <ul className={styles.cards}>
                {projects.map((p) => (
                  <li key={p.id} style={{ display: 'grid' }}>
                    <ProjectCard project={p} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Card as="aside" aria-labelledby="deadlines-title">
            <h2 id="deadlines-title" className={styles.sectionTitle}>
              Ближайшие дедлайны
            </h2>
            {upcoming.length === 0 ? (
              <p className={styles.muted}>Открытых этапов со сроком нет — можно выдохнуть.</p>
            ) : (
              <ul className={styles.deadlineList}>
                {upcoming.map((d) => (
                  <li key={d.stageId} className={styles.deadlineItem}>
                    <Link to={`/projects/${d.projectId}`}>{d.stageTitle}</Link>
                    <span className={styles.muted}>
                      {d.projectTitle} · осталось {d.remaining}
                    </span>
                    <span>
                      <DeadlineBadge deadline={d.deadline} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

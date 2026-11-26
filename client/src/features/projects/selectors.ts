import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { projectProgress, upcomingDeadlines } from '../../lib/progress';
import type { DetailState } from './projectsSlice';

export const selectProjects = (state: RootState) => state.projects.items;
export const selectListStatus = (state: RootState) => state.projects.listStatus;
export const selectListError = (state: RootState) => state.projects.listError;

export const selectProjectById = (state: RootState, id: string | undefined) =>
  id ? state.projects.items.find((p) => p.id === id) : undefined;

const IDLE: DetailState = { status: 'idle', error: null, notFound: false };
export const selectDetailState = (state: RootState, id: string | undefined): DetailState =>
  (id && state.projects.detail[id]) || IDLE;

export const selectIsBusy = (state: RootState, key: string) => state.projects.pending.includes(key);

/** Поиск по названию и курсу (без учёта регистра). Мемоизирован: пересчитывается только при смене данных или запроса. */
export const selectFilteredProjects = createSelector(
  [selectProjects, (_: RootState, query: string) => query.trim().toLowerCase()],
  (projects, query) =>
    query ? projects.filter((p) => `${p.title} ${p.course}`.toLowerCase().includes(query)) : projects,
);

export const selectUpcomingDeadlines = createSelector([selectProjects], (projects) => upcomingDeadlines(projects));

export const selectOverallStats = createSelector([selectProjects], (projects) => {
  const totals = projects.map(projectProgress);
  const done = totals.reduce((s, p) => s + p.done, 0);
  const total = totals.reduce((s, p) => s + p.total, 0);
  return { projects: projects.length, done, total, percent: total ? Math.round((done / total) * 100) : 0 };
});

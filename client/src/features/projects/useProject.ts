import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProject } from './projectsSlice';
import { selectDetailState, selectProjectById } from './selectors';

/**
 * Проект по id из адресной строки. Если его ещё нет в сторе (открыли страницу по прямой
 * ссылке или обновили вкладку), загружает его отдельным запросом.
 */
export function useProject(projectId: string | undefined) {
  const dispatch = useAppDispatch();
  const project = useAppSelector((s) => selectProjectById(s, projectId));
  const detail = useAppSelector((s) => selectDetailState(s, projectId));

  useEffect(() => {
    if (projectId && !project && detail.status === 'idle') void dispatch(fetchProject(projectId));
  }, [projectId, project, detail.status, dispatch]);

  const retry = useCallback(() => {
    if (projectId) void dispatch(fetchProject(projectId));
  }, [projectId, dispatch]);

  return { project, detail, retry };
}

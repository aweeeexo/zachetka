import { ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States';
import type { DetailState } from '../features/projects/projectsSlice';

/** Что показать, пока проекта нет в сторе: загрузку, «не найден» или ошибку. */
export function ProjectStatus({ detail, onRetry }: { detail: DetailState; onRetry: () => void }) {
  if (detail.status === 'failed' && detail.notFound) {
    return (
      <Card>
        <EmptyState
          icon="search"
          title="Проект не найден"
          text="Возможно, его удалили или ссылка неверная."
          action={
            <ButtonLink to="/" icon="arrowLeft" variant="secondary">
              К списку проектов
            </ButtonLink>
          }
        />
      </Card>
    );
  }
  if (detail.status === 'failed') {
    return (
      <Card>
        <ErrorState title="Не удалось загрузить проект" message={detail.error ?? ''} onRetry={onRetry} />
      </Card>
    );
  }
  return <Skeleton count={3} height={120} label="Загружаем проект…" />;
}

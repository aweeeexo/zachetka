import { PageHeader } from '../components/layout/PageHeader';
import { ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/States';

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Страница не найдена" documentTitle="404" />
      <Card>
        <EmptyState
          icon="search"
          title="Такой страницы нет"
          text="Проверьте адрес или вернитесь к списку проектов."
          action={
            <ButtonLink to="/" icon="arrowLeft">
              К проектам
            </ButtonLink>
          }
        />
      </Card>
    </>
  );
}

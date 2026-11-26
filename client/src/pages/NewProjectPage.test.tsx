import { screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { NewProjectPage } from './NewProjectPage';

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/new" element={<NewProjectPage />} />
      <Route path="/projects/:projectId" element={<h1>Страница проекта</h1>} />
    </Routes>,
    { route: '/new' },
  );
}

describe('NewProjectPage — сценарий «задание → план → проект»', () => {
  it('до разбора показывает пустое состояние', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Здесь появится план' })).toBeInTheDocument();
  });

  it('не отправляет пустую форму и показывает ошибки у полей', async () => {
    const { user, store } = renderPage();
    await user.click(screen.getByRole('button', { name: 'Разобрать задание' }));

    expect(screen.getByLabelText('Название проекта')).toHaveAccessibleDescription('Введите название проекта');
    expect(screen.getByLabelText('Текст задания')).toHaveAccessibleDescription('Вставьте текст задания');
    expect(store.getState().parse.status).toBe('idle');
  });

  it('разбирает пример, даёт поправить черновик и сохраняет проект', async () => {
    const { user, store } = renderPage();

    await user.click(screen.getByRole('button', { name: 'Вставить пример' }));
    await user.click(screen.getByRole('button', { name: 'Разобрать задание' }));

    expect(await screen.findByText('Этапов: 5')).toBeInTheDocument();
    const before = store.getState().parse.draft!.stats.requirements;

    // Удаляем первый пункт первого этапа.
    const firstStage = screen.getByRole('list', { name: /Пункты этапа «Презентация и защита идеи»/ });
    await user.click(within(firstStage).getAllByRole('button')[0]);
    expect(screen.getByText(`Пунктов: ${before - 1}`)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Сохранить проект' }));

    expect(await screen.findByRole('heading', { name: 'Страница проекта' })).toBeInTheDocument();
    const [project] = store.getState().projects.items;
    expect(project.title).toBe('Итоговый проект');
    expect(project.stages).toHaveLength(5);
  });
});

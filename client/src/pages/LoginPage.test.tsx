import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('валидирует пустую форму и показывает ошибки у полей', async () => {
    const { user } = renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { route: '/login' },
    );

    await user.click(screen.getByRole('button', { name: 'Войти' }));
    expect(screen.getByText('Введите email')).toBeInTheDocument();
    expect(screen.getByText('Введите пароль')).toBeInTheDocument();
  });

  it('входит как демо-студент и перенаправляет на главную', async () => {
    const { user } = renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Главная страница</div>} />
      </Routes>,
      { route: '/login' },
    );

    await user.click(screen.getByRole('button', { name: 'Войти как демо-студент' }));
    expect(await screen.findByText('Главная страница')).toBeInTheDocument();
  });
});

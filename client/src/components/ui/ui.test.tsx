import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { ConfirmButton } from './ConfirmButton';
import { TextField } from './Field';
import { EmptyState, ErrorState, Skeleton } from './States';

describe('Button', () => {
  it('вызывает onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Сохранить</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('в состоянии loading заблокирована и помечена aria-busy', () => {
    render(<Button loading>Сохранить</Button>);
    const button = screen.getByRole('button', { name: 'Сохранить' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('кнопка-иконка доступна по тексту для экранных читалок', () => {
    render(
      <Button icon="trash" iconOnly>
        Удалить проект
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Удалить проект' })).toBeInTheDocument();
  });
});

describe('TextField', () => {
  it('связывает подпись и ошибку с полем', () => {
    render(<TextField label="Название" error="Введите название" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Название');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Введите название');
    expect(screen.getByRole('alert')).toHaveTextContent('Введите название');
  });

  it('без ошибки показывает подсказку', () => {
    render(<TextField label="Курс" hint="Например, ШАД" />);
    expect(screen.getByLabelText('Курс')).toHaveAccessibleDescription('Например, ШАД');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('ConfirmButton', () => {
  it('удаляет только после подтверждения', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmButton question="Удалить проект?" onConfirm={onConfirm}>
        Удалить
      </ConfirmButton>,
    );

    await user.click(screen.getByRole('button', { name: 'Удалить' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Удалить проект?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Да, удалить' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Да, удалить' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('«Отмена» и Esc возвращают обычную кнопку', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmButton question="Удалить?" onConfirm={() => {}}>
        Удалить
      </ConfirmButton>,
    );
    await user.click(screen.getByRole('button', { name: 'Удалить' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });
});

describe('состояния', () => {
  it('EmptyState показывает заголовок и действие', () => {
    render(<EmptyState title="Пока нет проектов" action={<button>Создать</button>} />);
    expect(screen.getByRole('heading', { name: 'Пока нет проектов' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Создать' })).toBeInTheDocument();
  });

  it('ErrorState вызывает повтор запроса', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Сервер недоступен" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Сервер недоступен');
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('Skeleton объявляет загрузку', () => {
    render(<Skeleton count={3} label="Загружаем проекты…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Загружаем проекты…');
  });
});

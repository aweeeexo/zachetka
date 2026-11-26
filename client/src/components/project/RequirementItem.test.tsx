import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeRequirement } from '../../test/factories';
import { RequirementItem } from './RequirementItem';

function setup(overrides: Parameters<typeof makeRequirement>[0] = {}, busy = false) {
  const handlers = { onToggle: vi.fn(), onSave: vi.fn(), onDelete: vi.fn(), onShowSource: vi.fn() };
  const requirement = makeRequirement({ text: 'Написать README', sourceLine: 12, quoteFound: true, ...overrides });
  const user = userEvent.setup();
  render(
    <ul>
      <RequirementItem requirement={requirement} busy={busy} {...handlers} />
    </ul>,
  );
  return { user, ...handlers };
}

describe('RequirementItem', () => {
  it('отмечает пункт кликом по тексту', async () => {
    const { user, onToggle } = setup();
    await user.click(screen.getByText('Написать README'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('показывает приоритет и ссылку на строку источника', async () => {
    const { user, onShowSource } = setup({ priority: 'bonus' });
    expect(screen.getByText('Бонус')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /стр\. 12/ }));
    expect(onShowSource).toHaveBeenCalledOnce();
  });

  it('предупреждает, если цитата не найдена в тексте', () => {
    setup({ quoteFound: false });
    expect(screen.getByText('проверьте вручную')).toBeInTheDocument();
  });

  it('редактирует текст и приоритет с валидацией', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('button', { name: 'Изменить пункт «Написать README»' }));

    const input = screen.getByLabelText('Текст пункта');
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Опишите пункт');
    expect(onSave).not.toHaveBeenCalled();

    await user.type(input, '  Написать README и инструкцию  ');
    await user.selectOptions(screen.getByLabelText('Приоритет'), 'bonus');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(onSave).toHaveBeenCalledWith({ text: 'Написать README и инструкцию', priority: 'bonus' });
  });

  it('удаляет после подтверждения', async () => {
    const { user, onDelete } = setup();
    await user.click(screen.getByRole('button', { name: 'Удалить пункт «Написать README»' }));
    await user.click(screen.getByRole('button', { name: 'Да' }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('пока идёт запрос, действия заблокированы', () => {
    setup({}, true);
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /Изменить пункт/ })).toBeDisabled();
  });
});

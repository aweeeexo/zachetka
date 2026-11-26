import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { createMockApi } from '../api/mockApi';
import { memoryStorage, type KeyValueStorage } from '../api/storage';
import type { Api } from '../api/types';
import { setupStore } from '../app/store';

/** Моковый API для тестов: данные в памяти, без задержек и без демо-проекта. */
export function createTestApi(storage: KeyValueStorage = memoryStorage(), now = () => new Date(2026, 10, 1)): Api {
  return createMockApi({ storage, delayMs: 0, seed: false, now });
}

interface Options {
  route?: string;
  api?: Api;
}

/** Рендер компонента внутри Redux-стора и роутера — как в приложении. */
export function renderWithProviders(ui: ReactElement, { route = '/', api = createTestApi() }: Options = {}) {
  const store = setupStore(api);
  const user = userEvent.setup();
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  );
  return { store, user, api, ...result };
}

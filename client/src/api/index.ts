import { createMockApi } from './mockApi';
import { browserStorage } from './storage';

/** Хранилище приложения. Экспортируем отдельно — им пользуется страница «О проекте» (режим отладки). */
export const appStorage = browserStorage();

/** Единая точка входа в API. На этапе 4 здесь будет createHttpApi(import.meta.env.VITE_API_URL). */
export const api = createMockApi({ storage: appStorage });

export type { Api } from './types';
export { ApiError, errorMessage } from './types';

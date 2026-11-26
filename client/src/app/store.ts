import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { api as defaultApi } from '../api';
import type { Api } from '../api/types';
import parseReducer from '../features/parse/parseSlice';
import projectsReducer from '../features/projects/projectsSlice';
import toastsReducer from '../features/toasts/toastsSlice';
import type { ThunkExtra } from './thunk';

const rootReducer = combineReducers({
  projects: projectsReducer,
  parse: parseReducer,
  toasts: toastsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** Фабрика стора: в приложении — с моковым API, в тестах — с любым другим. */
export function setupStore(api: Api = defaultApi, preloadedState?: Partial<RootState>) {
  const extra: ThunkExtra = { api };
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: { extraArgument: extra } }),
  });
}

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

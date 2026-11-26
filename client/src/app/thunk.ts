import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError, errorMessage, type Api } from '../api/types';
import type { RootState } from './store';

/** Зависимости, которые получают все thunk'и через extraArgument. В тестах сюда подставляется фейковый API. */
export interface ThunkExtra {
  api: Api;
}

/** Что попадает в action.payload при ошибке запроса. */
export interface RequestFailure {
  message: string;
  status: number | null;
}

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  extra: ThunkExtra;
  rejectValue: RequestFailure;
}>();

export function toFailure(error: unknown): RequestFailure {
  return { message: errorMessage(error), status: error instanceof ApiError ? error.status : null };
}

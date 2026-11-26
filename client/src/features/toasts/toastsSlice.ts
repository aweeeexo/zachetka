import { createSlice, isRejected, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import { loginUser, logoutUser, registerUser } from '../auth/authSlice';
import {
  addRequirement,
  createProject,
  deleteProject,
  deleteRequirement,
  mutationThunks,
  updateProject,
  updateRequirement,
} from '../projects/projectsSlice';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

export interface ToastsState {
  items: Toast[];
}

const MAX_TOASTS = 4;
export const initialState: ToastsState = { items: [] };

function push(state: ToastsState, kind: ToastKind, message: string) {
  state.items.push({ id: nanoid(), kind, message });
  if (state.items.length > MAX_TOASTS) state.items.shift();
}

const toastsSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    toastShown: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items.push(action.payload);
        if (state.items.length > MAX_TOASTS) state.items.shift();
      },
      prepare(kind: ToastKind, message: string) {
        return { payload: { id: nanoid(), kind, message } };
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => push(state, 'success', `Добро пожаловать, ${action.payload.name}`))
      .addCase(registerUser.fulfilled, (state, action) => push(state, 'success', `Аккаунт создан для ${action.payload.name}`))
      .addCase(logoutUser.fulfilled, (state) => push(state, 'info', 'Вы вышли из аккаунта'))
      .addCase(createProject.fulfilled, (state, action) => push(state, 'success', `Проект «${action.payload.title}» создан`))
      .addCase(updateProject.fulfilled, (state) => push(state, 'success', 'Изменения сохранены'))
      .addCase(deleteProject.fulfilled, (state) => push(state, 'info', 'Проект удалён'))
      .addCase(addRequirement.fulfilled, (state) => push(state, 'success', 'Пункт добавлен'))
      .addCase(updateRequirement.fulfilled, (state, action) => {
        if (action.meta.arg.patch.text !== undefined || action.meta.arg.patch.priority !== undefined) {
          push(state, 'success', 'Пункт обновлён');
        }
      })
      .addCase(deleteRequirement.fulfilled, (state) => push(state, 'info', 'Пункт удалён'))
      // Любая неудачная операция изменения показывает уведомление с текстом ошибки.
      .addMatcher(isRejected(...mutationThunks), (state, action) => {
        push(state, 'error', action.payload?.message ?? 'Не удалось сохранить изменения');
      });
  },
});

export const { toastShown, toastDismissed } = toastsSlice.actions;
export default toastsSlice.reducer;

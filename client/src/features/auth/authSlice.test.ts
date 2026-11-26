import { describe, expect, it } from 'vitest';
import { DEMO_CREDENTIALS } from '../../api/mockApi';
import { setupStore } from '../../app/store';
import { createTestApi } from '../../test/utils';
import { fetchCurrentUser, loginUser, logoutUser, registerUser } from './authSlice';

describe('authSlice', () => {
  it('входит в демо-аккаунт, сохраняет сессию и выходит', async () => {
    const api = createTestApi();
    const store = setupStore(api);

    await store.dispatch(loginUser({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password }));
    expect(store.getState().auth.user?.email).toBe(DEMO_CREDENTIALS.email);
    expect(store.getState().auth.error).toBeNull();

    // Восстановление сессии в новом сторе с тем же хранилищем.
    const freshStore = setupStore(api);
    await freshStore.dispatch(fetchCurrentUser());
    expect(freshStore.getState().auth.user?.email).toBe(DEMO_CREDENTIALS.email);

    await freshStore.dispatch(logoutUser());
    expect(freshStore.getState().auth.user).toBeNull();
  });

  it('возвращает ошибку при неверном пароле', async () => {
    const store = setupStore(createTestApi());
    await store.dispatch(loginUser({ email: DEMO_CREDENTIALS.email, password: 'wrong-password' }));
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.error).toMatch(/Неверный email или пароль/i);
  });

  it('регистрирует нового пользователя и запрещает дубликат email', async () => {
    const api = createTestApi();
    const store = setupStore(api);

    await store.dispatch(registerUser({ name: 'Мария', email: 'maria@shad.ru', password: 'secret123' }));
    expect(store.getState().auth.user?.name).toBe('Мария');

    await store.dispatch(logoutUser());
    await store.dispatch(registerUser({ name: 'Мария 2', email: 'maria@shad.ru', password: 'secret123' }));
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.error).toMatch(/уже существует/i);
  });
});

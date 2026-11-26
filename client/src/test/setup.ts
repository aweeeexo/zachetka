// Подключается Vitest перед каждым тестовым файлом (см. vite.config.ts → test.setupFiles).
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

afterEach(() => {
  window.localStorage.clear();
});

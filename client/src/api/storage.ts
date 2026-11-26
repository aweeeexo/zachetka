/** Минимальный интерфейс хранилища — так mockApi можно тестировать на памяти, без localStorage. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

/**
 * localStorage, если он доступен. В приватном режиме или при запрете cookies
 * обращение к localStorage бросает исключение — тогда работаем в памяти.
 */
export function browserStorage(): KeyValueStorage {
  try {
    const probe = '__zachetka_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage();
  }
}

export const STORAGE_KEYS = {
  projects: 'zachetka:projects:v1',
  simulateErrors: 'zachetka:simulate-errors',
} as const;

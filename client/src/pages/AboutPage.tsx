import { useState } from 'react';
import { appStorage } from '../api';
import { resetDemoData, setSimulatedErrors } from '../api/mockApi';
import { STORAGE_KEYS } from '../api/storage';
import { useAppDispatch } from '../app/hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { fetchProjects } from '../features/projects/projectsSlice';
import { toastShown } from '../features/toasts/toastsSlice';
import styles from './Pages.module.css';

export function AboutPage() {
  const dispatch = useAppDispatch();
  const [simulate, setSimulate] = useState(() => appStorage.getItem(STORAGE_KEYS.simulateErrors) === '1');

  function toggleErrors(enabled: boolean) {
    setSimulatedErrors(appStorage, enabled);
    setSimulate(enabled);
    dispatch(toastShown('info', enabled ? 'Режим ошибок включён: запросы будут падать' : 'Режим ошибок выключен'));
  }

  function resetData() {
    resetDemoData(appStorage);
    void dispatch(fetchProjects());
    dispatch(toastShown('success', 'Демо-данные восстановлены'));
  }

  return (
    <>
      <PageHeader title="О проекте" documentTitle="О проекте" subtitle="Зачётка — AI-планировщик учебных проектов" />
      <div className={styles.aboutGrid}>
        <Card as="section" className={styles.prose} aria-labelledby="what-title">
          <h2 id="what-title" className={styles.sectionTitle}>
            Что это
          </h2>
          <p>
            Зачётка превращает длинное учебное задание в план сдачи: этапы с дедлайнами и чек-лист требований. У каждого
            пункта есть ссылка на строку исходного текста — видно, откуда он взялся.
          </p>
          <ul>
            <li>Вставьте задание и получите черновик плана.</li>
            <li>Отмечайте сделанное, добавляйте и правьте пункты.</li>
            <li>Перед сдачей откройте «Готовность» и выгрузите чек-лист в README.</li>
          </ul>
          <p className={styles.muted}>
            Это MVP третьего этапа: данные хранятся в вашем браузере (localStorage), разбор задания пока работает на
            правилах. На этапе 4 появятся сервер, база данных и AI-разбор.
          </p>
        </Card>

        <Card as="section" className={styles.prose} aria-labelledby="stack-title">
          <h2 id="stack-title" className={styles.sectionTitle}>
            Как устроено
          </h2>
          <ul>
            <li>React 19 + TypeScript, сборка Vite.</li>
            <li>Redux Toolkit: слайсы, селекторы, createAsyncThunk.</li>
            <li>React Router: 5 страниц и страница 404.</li>
            <li>CSS Modules, адаптивная bento-сетка.</li>
            <li>Vitest + React Testing Library.</li>
          </ul>
        </Card>

        <Card as="section" tone="soft" aria-labelledby="debug-title">
          <h2 id="debug-title" className={styles.sectionTitle}>
            Режим отладки
          </h2>
          <p className={styles.muted}>Помогает показать состояния интерфейса на защите.</p>
          <div className={styles.switchRow}>
            <input id="simulate-errors" type="checkbox" checked={simulate} onChange={(e) => toggleErrors(e.target.checked)} />
            <label htmlFor="simulate-errors">
              <strong>Имитировать ошибки сервера</strong>
              <br />
              <span className={styles.muted}>Все запросы будут завершаться ошибкой 503 — увидите экраны ошибок и откат галочек.</span>
            </label>
          </div>
          <Button variant="secondary" icon="refresh" onClick={resetData}>
            Восстановить демо-данные
          </Button>
        </Card>
      </div>
    </>
  );
}

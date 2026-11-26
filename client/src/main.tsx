import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router';
import { App } from './App';
import { setupStore } from './app/store';
import './styles/global.css';

// HashRouter (адреса вида /#/projects/1): GitHub Pages отдаёт только статические файлы,
// и с ним прямые ссылки и обновление страницы работают без настройки сервера.
const store = setupStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </StrictMode>,
);

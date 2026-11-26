import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NewProjectPage } from './pages/NewProjectPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProjectPage } from './pages/ProjectPage';
import { ReadinessPage } from './pages/ReadinessPage';

/** При переходе на другую страницу прокручиваем к началу. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="new" element={<NewProjectPage />} />
          <Route path="projects/:projectId" element={<ProjectPage />} />
          <Route path="projects/:projectId/ready" element={<ReadinessPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

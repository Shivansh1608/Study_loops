import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { fetchMe, fetchProgressOverview, type ProgressOverview } from './api/client';
import { Navbar } from './components/Navbar';

import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Configure from './pages/Configure';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Flashcards from './pages/Flashcards';
import Review from './pages/Review';
import Summary from './pages/Summary';
import Login from './pages/Login';
import Register from './pages/Register';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function AppLayout({ children }: { children: React.ReactNode }) {
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const location = useLocation();
  const { initialize, setUser } = useAuthStore();

  useEffect(() => {
    initialize();
    async function loadUserAndOverview() {
      try {
        const [me, ov] = await Promise.allSettled([
          fetchMe(),
          fetchProgressOverview(),
        ]);
        if (me.status === 'fulfilled') setUser(me.value);
        if (ov.status === 'fulfilled') setOverview(ov.value);
      } catch (err) {
        console.error('Initial session fetch error:', err);
      }
    }
    loadUserAndOverview();
  }, [location.pathname]);

  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-purple-100 selection:text-purple-700">
      {!hideNavbar && (
        <Navbar
          streak={overview?.current_streak_days || 0}
          dueCardsCount={overview?.cards_due_today || 0}
        />
      )}

      <main className="flex-1 pb-16">{children}</main>

      {/* Footer */}
      {!hideNavbar && (
        <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-xs py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} NoteWise AI (Study Loop) • Built for active learning & spaced repetition</p>
            <div className="flex items-center space-x-4 text-slate-500 font-semibold">
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-purple-600">
                FastAPI Swagger
              </a>
              <a href="http://localhost:8000/health" target="_blank" rel="noreferrer" className="hover:text-purple-600">
                API Health
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/configure/:documentId" element={<Configure />} />
            <Route path="/quiz/:quizId" element={<Quiz />} />
            <Route path="/results/:attemptId" element={<Results />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/review" element={<Review />} />
            <Route path="/summary/:documentId" element={<Summary />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

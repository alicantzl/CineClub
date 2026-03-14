import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login    from './pages/Login';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Room     from './pages/Room';
import Friends  from './pages/Friends';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import { useAuth }      from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import TitleBar from './components/layout/TitleBar';

function App() {
  useAuth();
  const { user, loading } = useAuthStore();

  /* ── Window state → body classes ── */
  useEffect(() => {
    const el = window.electron;
    if (!el) return;

    // F11 fullscreen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        el.windowControl('toggle-fullscreen');
      }
    };

    el.onWindowStateChange((state: string) => {
      document.body.classList.toggle('is-maximized',  state === 'maximized');
      document.body.classList.toggle('is-fullscreen', state === 'fullscreen');
    });

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ── Splash / loading screen ── */
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#030712] flex flex-col items-center justify-center select-none">
        {/* Logo */}
        <div className="relative mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-[20px] rotate-45 shadow-2xl animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-[20px] rotate-45 blur-xl opacity-40 animate-pulse" />
        </div>
        {/* Spinner */}
        <div className="w-8 h-8 border-2 border-white/5 border-t-pink-500 rounded-full animate-spin mb-6" />
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
          CineClub Başlatılıyor
        </p>
      </div>
    );
  }

  return (
    /**
     * app-root: full viewport column
     *   ├── TitleBar (fixed 32px, always on top)
     *   └── content-area: flex-1, overflow-hidden
     *       hosts BrowserRouter → pages
     */
    <div id="app-root" className="flex flex-col h-screen w-screen overflow-hidden">

      {/* Global TitleBar — always visible regardless of route */}
      <TitleBar />

      {/* Route content fills remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Router>
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/discover"  element={<PrivateRoute><Discover /></PrivateRoute>} />
            <Route path="/friends"   element={<PrivateRoute><Friends /></PrivateRoute>} />
            <Route path="/room/:id"  element={<PrivateRoute><Room /></PrivateRoute>} />
            <Route path="/messages"      element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/messages/:chatId" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/settings"  element={<PrivateRoute><Settings /></PrivateRoute>} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;

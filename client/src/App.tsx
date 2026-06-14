import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { AppRouter } from './routes/AppRouter';
import { LoadingPage } from './pages/LoadingPage';
import { useAppDispatch, useAppSelector } from './hooks';

import { clearAuth } from './features/slices/authSlice';
import { verifyAuthThunk } from './features/thunks/authThunks';
import { selectTheme } from './features/slices/themeSlice';

export function App() {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector(selectTheme);
  const [booting, setBooting] = useState(true);

  /* Apply theme class to <html> */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  /* On mount: if we have a token, verify it (loads user into Redux) */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setBooting(false);
      return;
    }
    dispatch(verifyAuthThunk()).finally(() => setBooting(false));
  }, [dispatch]);

  /* Listen for forced logout from apiClient (e.g. refresh-token expiry) */
  useEffect(() => {
    const handler = () => dispatch(clearAuth());
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [dispatch]);

  if (booting) {
    return <LoadingPage message="Starting your journey…" />;
  }

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        richColors
        theme={mode}
        toastOptions={{
          style: {
            fontFamily: 'Poppins, sans-serif',
          },
        }}
      />
    </>
  );
}

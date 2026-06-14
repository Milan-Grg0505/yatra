import { Outlet, Link } from 'react-router-dom';
import { Logo, ThemeToggle } from '@/components/atoms';
import { ROUTES } from '@/lib/constant';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-surface to-accent-500/5 dark:from-dark-surface dark:via-dark-surface-2 dark:to-primary-900/20">
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to={ROUTES.HOME}><Logo /></Link>
        <ThemeToggle />
      </header>
      <main className="flex-1 grid place-items-center px-4 py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
      <footer className="text-center text-xs text-text-3 py-4">
        © {new Date().getFullYear()} Yatra · Hotels & Travel for Nepal
      </footer>
    </div>
  );
}

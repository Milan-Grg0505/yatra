import { Link, useNavigate } from 'react-router-dom';
import {
  LuTriangleAlert,
  LuHouse,
  LuArrowLeft,
  LuRotateCw,
  LuCompass,
  LuMessageSquare,
} from 'react-icons/lu';
import { Button, Logo } from '@/components/atoms';
import { ROUTES } from '@/lib/constant';
import { cn } from '@/lib/utils';

interface ErrorPageProps {
  /** Numeric code displayed prominently — e.g. 404, 500. */
  code?: number | string;
  /** Short headline. */
  title?: string;
  /** Longer description below the headline. */
  message?: string;
  /** Optional retry handler — adds a "Try again" button. */
  onRetry?: () => void;
  /** Hide the brand logo (used inside Dashboard sub-layouts). */
  hideBrand?: boolean;
  className?: string;
}

/**
 * Reusable error screen — works as:
 *  - Router errorElement (reads `useRouteError` automatically)
 *  - Catch-all 404 page
 *  - Section-level fallback inside data-fetch pages
 *
 * Aesthetic: split layout with oversized status code in display font,
 * gradient orbs, subtle grid, and contextual recovery actions.
 */
export function ErrorPage({
  code,
  title,
  message,
  onRetry,
  hideBrand,
  className,
}: ErrorPageProps) {
  const navigate = useNavigate();

  // If used as router errorElement, derive code/title from the thrown error
  let resolvedCode = code;
  let resolvedTitle = title;
  let resolvedMessage = message;

  // Defaults
  resolvedCode = resolvedCode ?? 500;
  resolvedTitle = resolvedTitle ?? 'Something went off-track';
  resolvedMessage =
    resolvedMessage ??
    'We could not load this page. Try again, or take another route from the home screen.';

  const is404 = String(resolvedCode) === '404';

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden bg-surface dark:bg-dark-surface',
        className,
      )}
    >
      {/* Background atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-80 dark:opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(60% 60% at 0% 0%, rgba(59,130,246,0.18) 0%, transparent 60%),
            radial-gradient(60% 60% at 100% 100%, rgba(245,158,11,0.14) 0%, transparent 60%)
          `,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {!hideBrand && (
        <div className="relative px-6 py-5">
          <Link to={ROUTES.HOME}>
            <Logo />
          </Link>
        </div>
      )}

      <div className="relative grid place-items-center px-6 py-10">
        <div className="max-w-2xl w-full">
          <div className="text-center">
            {/* Oversized status code */}
            <div className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full"
              />
              <h1 className="relative font-display text-[6rem] sm:text-[8rem] leading-none font-bold bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 bg-clip-text text-transparent">
                {resolvedCode}
              </h1>
            </div>

            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-xs font-medium">
              <LuTriangleAlert className="h-3.5 w-3.5" />
              {is404 ? 'Off the trail' : 'Unexpected detour'}
            </div>

            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-text dark:text-dark-text">
              {resolvedTitle}
            </h2>
            <p className="mt-3 text-text-2 dark:text-dark-text-2 max-w-md mx-auto">
              {resolvedMessage}
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to={ROUTES.HOME}>
                <LuHouse className="h-4 w-4" /> Back home
              </Link>
            </Button>

            {onRetry ? (
              <Button variant="outline" size="lg" onClick={onRetry}>
                <LuRotateCw className="h-4 w-4" /> Try again
              </Button>
            ) : (
              <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
                <LuArrowLeft className="h-4 w-4" /> Go back
              </Button>
            )}
          </div>

          {/* Helpful next steps */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NextStep
              to={ROUTES.HOTELS}
              icon={<LuCompass className="h-5 w-5" />}
              title="Explore hotels"
              desc="Browse stays across Nepal"
            />
            <NextStep
              to={ROUTES.TRAVEL_PACKAGES}
              icon={<LuCompass className="h-5 w-5" />}
              title="Travel packages"
              desc="Curated trips & treks"
            />
            <NextStep
              to={ROUTES.CHAT}
              icon={<LuMessageSquare className="h-5 w-5" />}
              title="Ask Yatra AI"
              desc="Get instant help"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NextStep({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group relative p-4 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-card transition text-left"
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition">
        {icon}
      </div>
      <p className="mt-3 font-semibold text-text dark:text-dark-text">{title}</p>
      <p className="text-xs text-text-3 mt-0.5">{desc}</p>
    </Link>
  );
}

/* ---------- Dedicated 404 ---------- */
export function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      title="Page not found"
      message="The page you're looking for doesn't exist or has been moved."
    />
  );
}

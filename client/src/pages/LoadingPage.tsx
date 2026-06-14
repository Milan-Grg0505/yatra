import { LuMountain } from 'react-icons/lu';
import { cn } from '@/lib/utils';

interface LoadingPageProps {
  message?: string;
  /** When false → fits its container instead of full viewport. */
  fullscreen?: boolean;
  className?: string;
}

/**
 * Full-bleed branded loader used during initial auth verification,
 * route transitions, and any heavy data fetch.
 *
 * Aesthetic: layered radial gradient, animated mountain ring, dot trail.
 * Honors light & dark themes and never blocks accessibility (aria-live="polite").
 */
export function LoadingPage({
  message = 'Preparing your journey…',
  fullscreen = true,
  className,
}: LoadingPageProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative grid place-items-center overflow-hidden',
        fullscreen ? 'min-h-screen' : 'min-h-[60vh] py-20',
        'bg-surface dark:bg-dark-surface',
        className,
      )}
    >
      {/* Background atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 dark:opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(60% 50% at 50% 10%, rgba(59,130,246,0.18) 0%, transparent 60%),
            radial-gradient(60% 50% at 80% 90%, rgba(245,158,11,0.12) 0%, transparent 60%),
            radial-gradient(40% 30% at 20% 80%, rgba(59,130,246,0.10) 0%, transparent 60%)
          `,
        }}
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative flex flex-col items-center text-center px-6">
        {/* Mountain logo + orbiting ring */}
        <div className="relative h-28 w-28">
          {/* Outer ring */}
          <span className="absolute inset-0 rounded-full border-2 border-primary-200/50 dark:border-primary-800/40" />
          {/* Rotating partial ring */}
          <span
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: 'var(--color-primary-500)',
              borderRightColor: 'var(--color-primary-500)',
              animation: 'spin 1.4s linear infinite',
            }}
          />
          {/* Soft glow */}
          <span className="absolute inset-2 rounded-full bg-primary-500/10 blur-xl" />
          {/* Center mark */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-elevated grid place-items-center animate-pulse-soft">
              <LuMountain className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Brand wordmark */}
        <h2 className="mt-7 font-display text-2xl font-bold tracking-tight text-text dark:text-dark-text">
          Yatra
        </h2>
        <p className="mt-1 text-sm text-text-2 dark:text-dark-text-2 max-w-sm">{message}</p>

        {/* Dot trail */}
        <div className="mt-5 flex items-center gap-1.5" aria-hidden>
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse-soft" />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse-soft"
            style={{ animationDelay: '0.2s' }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse-soft"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>

      <span className="sr-only">Loading content, please wait.</span>
    </div>
  );
}

/** Compact inline loader for sections inside a layout. */
export function LoadingSection({ message }: { message?: string }) {
  return <LoadingPage fullscreen={false} message={message} />;
}

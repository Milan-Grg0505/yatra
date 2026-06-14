import { Link, useLocation } from 'react-router-dom';
import { LuChevronRight, LuHouse } from 'react-icons/lu';
import { ROUTES } from '@/lib/constant';

export interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  /** Provide explicit crumbs for full control (last item is treated as current page). */
  items?: Crumb[];
  className?: string;
}

/**
 * Breadcrumbs nav.
 * - Pass `items` to control labels and links explicitly (recommended for detail pages).
 * - Pass no items and we'll auto-build from `useLocation().pathname`.
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const { pathname } = useLocation();
  const crumbs = items ?? autoCrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm text-text-2 dark:text-dark-text-2 ${className}`}>
      <Link to={ROUTES.HOME} className="hover:text-primary-600 flex items-center gap-1">
        <LuHouse className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only">Home</span>
      </Link>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="flex items-center">
            <LuChevronRight className="h-3.5 w-3.5 mx-2 text-text-3" />
            {last || !c.to ? (
              <span className="font-medium text-text dark:text-dark-text truncate max-w-[60vw]">{c.label}</span>
            ) : (
              <Link to={c.to} className="hover:text-primary-600 truncate max-w-[40vw]">{c.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function autoCrumbs(pathname: string): Crumb[] {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((seg, i, arr) => ({
      label: seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      to: '/' + arr.slice(0, i + 1).join('/'),
    }));
}

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as Accordion from '@radix-ui/react-accordion';
import {
  LuCalendar,
  LuUsers,
  LuMountain,
  LuCircleCheck,
  LuCircleX,
  LuUtensilsCrossed,
  LuChevronDown,
} from 'react-icons/lu';
import { Badge, Button, Rating } from '@/components/atoms';
import { LoadingSection } from '@/pages/LoadingPage';
import { ErrorPage } from '@/pages/ErrorPage';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectTravel } from '@/features/slices/travelSlice';
import { fetchTravelPackageByIdThunk } from '@/features/thunks/travelThunks';
import { formatCurrency, difficultyColor, cn } from '@/lib/utils';
import { FALLBACK_IMAGE, ROUTES } from '@/lib/constant';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';

export function PackageDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { currentPackage, loading } = useAppSelector(selectTravel);

  useEffect(() => {
    if (id) dispatch(fetchTravelPackageByIdThunk(id));
  }, [dispatch, id]);

  if (loading && !currentPackage) return <LoadingSection message="Loading package…" />;
  if (!currentPackage) return <ErrorPage code={404} title="Package not found" />;

  const p = currentPackage;
  const price = p.discount_price ?? p.price_per_person;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Travel Packages', to: ROUTES.TRAVEL_PACKAGES },
          { label: p.name },
        ]}
        className="mb-4"
      />
      {/* Hero */}
      <div className="relative h-96 rounded-3xl overflow-hidden">
        <img src={p.featured_image ?? FALLBACK_IMAGE} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex gap-2 mb-3">
            <Badge className={cn('capitalize', difficultyColor(p.difficulty_level))}>{p.difficulty_level}</Badge>
            <Badge variant="primary">{p.duration_days}D / {p.duration_nights}N</Badge>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">{p.name}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <Rating value={p.average_rating} />
            <span className="flex items-center gap-1"><LuUsers className="h-4 w-4" /> {p.group_size_min}-{p.group_size_max} people</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 mt-8">
        <div className="space-y-8">
          {/* Description */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-text-2 leading-relaxed">{p.description}</p>
          </section>

          {/* Itinerary */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Day-by-day itinerary</h2>
            <Accordion.Root type="single" collapsible className="space-y-2">
              {p.itinerary.map((day) => (
                <Accordion.Item key={day.day} value={String(day.day)} className="rounded-xl border border-border dark:border-dark-border overflow-hidden">
                  <Accordion.Header>
                    <Accordion.Trigger className="w-full px-4 py-3 flex items-center justify-between text-left bg-surface-2 dark:bg-dark-surface-2 hover:bg-surface-3 dark:hover:bg-dark-surface-3 group">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-primary-600 text-white grid place-items-center text-sm font-bold">{day.day}</span>
                        <span className="font-medium">{day.title}</span>
                      </div>
                      <LuChevronDown className="h-5 w-5 transition group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="px-4 py-3 bg-surface dark:bg-dark-surface">
                    <p className="text-sm text-text-2">{day.description}</p>
                    {day.activities?.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm">
                        {day.activities.map((a, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <LuMountain className="h-3.5 w-3.5 text-primary-600" /> {a}
                          </li>
                        ))}
                      </ul>
                    )}
                    {day.meals?.length > 0 && (
                      <p className="text-xs text-text-3 mt-3 flex items-center gap-1.5">
                        <LuUtensilsCrossed className="h-3.5 w-3.5" />
                        {day.meals.join(', ')}
                      </p>
                    )}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </section>

          {/* Inclusions / Exclusions */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Inclusions</h3>
              <ul className="space-y-2 text-sm">
                {p.inclusions.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <LuCircleCheck className="h-4 w-4 text-success mt-0.5 shrink-0" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Exclusions</h3>
              <ul className="space-y-2 text-sm">
                {p.exclusions.map((e) => (
                  <li key={e} className="flex items-start gap-2">
                    <LuCircleX className="h-4 w-4 text-danger mt-0.5 shrink-0" /> {e}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Booking card */}
        <aside className="lg:sticky lg:top-20 h-fit">
          <div className="p-6 rounded-2xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface shadow-card">
            <p className="text-xs text-text-2">Starting from</p>
            {p.discount_price && (
              <p className="text-sm text-text-3 line-through">{formatCurrency(p.price_per_person)}</p>
            )}
            <p className="text-3xl font-bold text-primary-600 mt-1">{formatCurrency(price)}</p>
            <p className="text-xs text-text-3 mb-5">per person</p>

            <div className="space-y-2 mb-5 text-sm">
              <div className="flex items-center gap-2 text-text-2">
                <LuCalendar className="h-4 w-4" /> {p.duration_days} days / {p.duration_nights} nights
              </div>
              <div className="flex items-center gap-2 text-text-2">
                <LuUsers className="h-4 w-4" /> {p.group_size_min}–{p.group_size_max} travelers
              </div>
            </div>

            <Button fullWidth size="lg">Book this package</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuLayoutGrid, LuList, LuMap } from 'react-icons/lu';
import { Button, Select, Skeleton } from '@/components/atoms';
import { HotelCard, SearchBar, MapView, NoResults } from '@/components/molecules';
import { FilterSidebar, type SearchFilters } from '@/components/organisms/FilterSidebar';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectHotel } from '@/features/slices/hotelSlice';
import { searchHotelsThunk } from '@/features/thunks/hotelThunks';
import { facilityApi } from '@/api/misc.api';
import type { Facility } from '@/types';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';

export function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { searchResults, loading, pagination } = useAppSelector(selectHotel);
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
  const [sort, setSort] = useState<string>(params.get('sort') ?? 'popularity');
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const filters: SearchFilters = useMemo(
    () => ({
      hotelType: params.get('hotelType') ?? undefined,
      minPrice: Number(params.get('minPrice') ?? 0),
      maxPrice: Number(params.get('maxPrice') ?? 50000),
      minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
      facilities: params.getAll('facilities'),
    }),
    [params],
  );

  useEffect(() => {
    facilityApi.list().then((r) => setFacilities(r.data ?? []));
  }, []);

  useEffect(() => {
    const queryParams: Record<string, any> = {
      city: params.get('city') ?? undefined,
      city_id: params.get('city_id') ?? undefined,
      checkIn: params.get('checkIn') ?? undefined,
      checkOut: params.get('checkOut') ?? undefined,
      guests: params.get('guests') ?? undefined,
      hotelType: filters.hotelType,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice !== 50000 ? filters.maxPrice : undefined,
      minRating: filters.minRating,
      page: Number(params.get('page') ?? 1),
      limit: 12,
      sort,
    };
    dispatch(searchHotelsThunk(queryParams));
  }, [dispatch, params, filters, sort]);

  const updateFilters = (next: SearchFilters) => {
    const newParams = new URLSearchParams(params);
    const setOr = (k: string, v: any) => {
      if (v === undefined || v === '' || v === null) newParams.delete(k);
      else newParams.set(k, String(v));
    };
    setOr('hotelType', next.hotelType);
    setOr('minPrice', next.minPrice || undefined);
    setOr('maxPrice', next.maxPrice !== 50000 ? next.maxPrice : undefined);
    setOr('minRating', next.minRating);
    newParams.delete('facilities');
    next.facilities.forEach((f) => newParams.append('facilities', f));
    newParams.set('page', '1');
    setParams(newParams);
  };

  const mapMarkers = searchResults
    .filter((h) => h.latitude && h.longitude)
    .map((h) => ({
      id: h.id,
      lat: h.latitude!,
      lng: h.longitude!,
      popup: <strong>{h.name}</strong>,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Hotels' }]} className="mb-4" />
      <div className="mb-6">
        <SearchBar
          defaultValues={{
            city: params.get('city') ?? '',
            checkIn: params.get('checkIn') ?? '',
            checkOut: params.get('checkOut') ?? '',
            guests: Number(params.get('guests') ?? 2),
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <FilterSidebar
          filters={filters}
          onChange={updateFilters}
          facilities={facilities}
          className="hidden lg:block sticky top-20 h-fit"
        />

        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm text-text-2">
              {loading
                ? 'Searching…'
                : `${pagination.total ?? searchResults.length} ${searchResults.length === 1 ? 'hotel' : 'hotels'
                } found`}
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                options={[
                  { value: 'popularity', label: 'Most popular' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Top rated' },
                ]}
                className="!h-9 !text-xs"
              />
              <div className="hidden sm:inline-flex rounded-lg border border-border dark:border-dark-border p-0.5">
                <Toggle active={view === 'grid'} onClick={() => setView('grid')}><LuLayoutGrid /></Toggle>
                <Toggle active={view === 'list'} onClick={() => setView('list')}><LuList /></Toggle>
                <Toggle active={view === 'map'} onClick={() => setView('map')}><LuMap /></Toggle>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3]" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <NoResults
              title="No hotels match your filters"
              message="Try removing some filters or broadening your search."
              action={{ label: 'Clear filters', onClick: () => setParams({}) }}
            />
          ) : view === 'map' ? (
            <MapView markers={mapMarkers} height="600px" />
          ) : view === 'list' ? (
            <div className="space-y-3">
              {searchResults.map((h) => (
                <HotelCard key={h.id} hotel={h} variant="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {searchResults.map((h) => (
                <HotelCard key={h.id} hotel={h} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => {
                      const np = new URLSearchParams(params);
                      np.set('page', String(page));
                      setParams(np);
                    }}
                    className={cn(
                      'h-9 w-9 rounded-lg text-sm font-medium border transition',
                      page === pagination.page
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-border dark:border-dark-border hover:bg-surface-2 dark:hover:bg-dark-surface-2',
                    )}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 h-8 rounded-md transition',
        active
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
          : 'text-text-2 hover:bg-surface-2',
      )}
    >
      {children}
    </button>
  );
}

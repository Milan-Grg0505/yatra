import { useEffect, useState } from 'react';
import { Skeleton, Select } from '@/components/atoms';
import { PackageCard, NoResults } from '@/components/molecules';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectTravel } from '@/features/slices/travelSlice';
import { fetchTravelPackagesThunk } from '@/features/thunks/travelThunks';
import { DIFFICULTY_LEVELS, ROUTES } from '@/lib/constant';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';

export function TravelPackagesPage() {
  const dispatch = useAppDispatch();
  const { packages, loading } = useAppSelector(selectTravel);
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    dispatch(fetchTravelPackagesThunk({ difficulty: difficulty || undefined, limit: 24 }));
  }, [dispatch, difficulty]);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Travel Packages', to: ROUTES.TRAVEL_PACKAGES },
          { label: 'Packages' },
        ]}
        className="mx-4 my-4"
      />
      {/* Hero */}
      <section
        className="relative h-72 grid place-items-center overflow-hidden"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="relative text-center text-white px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Nepal travel packages</h1>
          <p className="text-white/85 mt-2">Hand-curated treks, tours & multi-day adventures</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-text-2">{packages.length} packages</span>
          <Select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            options={[
              { value: '', label: 'All difficulties' },
              ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
            ]}
            className="!h-9 !max-w-xs"
          />
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[16/10]" />)}
          </div>
        ) : packages.length === 0 ? (
          <NoResults title="No packages found" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((p) => <PackageCard key={p.id} pkg={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

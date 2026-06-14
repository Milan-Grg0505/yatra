import { useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/atoms';
import { type Column } from '@/components/molecules/DataTable';
import { ResourceManager } from '@/components/organisms/ResourceManager';
import { TravelPackageForm } from '@/components/forms/TravelPackageForm';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectTravel } from '@/features/slices/travelSlice';
import {
  fetchTravelPackagesThunk,
  deleteTravelPackageThunk,
} from '@/features/thunks/travelThunks';
import { cn, formatCurrency, difficultyColor } from '@/lib/utils';
import type { TravelPackage } from '@/types';

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  upcoming: 'warning',
};

export function AdminTravelPackagesPage() {
  const dispatch = useAppDispatch();
  const { packages, loading } = useAppSelector(selectTravel);

  const refresh = () => dispatch(fetchTravelPackagesThunk({ limit: 100 }));
  useEffect(() => { refresh(); }, [dispatch]); // eslint-disable-line

  const columns: Column<TravelPackage>[] = [
    {
      key: 'name',
      header: 'Package',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2 min-w-0">
          {p.featured_image && (
            <img src={p.featured_image} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{p.name}</p>
            <p className="text-xs text-text-3 line-clamp-1">{p.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'duration_days',
      header: 'Duration',
      sortable: true,
      render: (p) => `${p.duration_days}D / ${p.duration_nights}N`,
    },
    {
      key: 'difficulty_level',
      header: 'Difficulty',
      render: (p) => (
        <Badge className={cn('capitalize', difficultyColor(p.difficulty_level))}>
          {p.difficulty_level}
        </Badge>
      ),
    },
    {
      key: 'price_per_person',
      header: 'Price',
      sortable: true,
      render: (p) => (
        <div>
          <p className={cn('font-semibold', p.discount_price && 'line-through text-text-3 text-sm')}>
            {formatCurrency(p.price_per_person)}
          </p>
          {p.discount_price && (
            <p className="text-sm font-semibold text-primary-600">{formatCurrency(p.discount_price)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'total_bookings',
      header: 'Bookings',
      sortable: true,
      render: (p) => p.total_bookings ?? 0,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge variant={STATUS_VARIANT[p.status] ?? 'default'} className="capitalize">
          {p.status}
        </Badge>
      ),
    },
  ];

  return (
    <ResourceManager<TravelPackage>
      title="Travel packages"
      subtitle="Curated multi-day Nepal itineraries — create, edit, and publish from here."
      entityName="package"
      data={packages}
      columns={columns}
      loading={loading}
      searchKey="name"
      modalSize="2xl"
      getId={(p) => p.id}
      getLabel={(p) => p.name}
      onRefresh={refresh}
      onDelete={async (p) => {
        const res = await dispatch(deleteTravelPackageThunk(p.id));
        if (deleteTravelPackageThunk.fulfilled.match(res)) toast.success('Package deleted');
      }}
      renderForm={({ editing, onDone }) => (
        <TravelPackageForm editing={editing} onDone={onDone} />
      )}
    />
  );
}

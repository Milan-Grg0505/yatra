import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuShieldCheck } from 'react-icons/lu';
import { toast } from 'sonner';
import { Badge, Button } from '@/components/atoms';
import { DataTable, type Column } from '@/components/molecules/DataTable';
import { ResourceManager } from '@/components/organisms/ResourceManager';
import { HotelForm } from '@/components/forms';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectHotel } from '@/features/slices/hotelSlice';
import { fetchHotelsThunk, deleteHotelThunk } from '@/features/thunks/hotelThunks';
import { cn, statusColor } from '@/lib/utils';
import { ROUTES } from '@/lib/constant';
import type { Hotel } from '@/types';

export function AdminHotelsPage() {
  const dispatch = useAppDispatch();
  const { hotels, loading } = useAppSelector(selectHotel);

  const refresh = () => dispatch(fetchHotelsThunk({ page: 1, limit: 200 }));
  useEffect(() => { refresh(); }, [dispatch]); // eslint-disable-line

  const pendingCount = useMemo(() => hotels.filter((h) => h.status === 'pending').length, [hotels]);

  const columns: Column<Hotel>[] = [
    {
      key: 'name',
      header: 'Hotel name',
      sortable: true,
      render: (h) => (
        <div className="flex items-center gap-2">
          {h.logo && <img src={h.logo} alt="" className="h-8 w-8 rounded object-cover" />}
          <span className="font-medium">{h.name}</span>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (h) => <span className="capitalize">{h.type}</span> },
    { key: 'pan_number', header: 'PAN Number', render: (h) => <span className="font-mono text-sm">{h.pan_number ?? '—'}</span> },
    {
      key: 'registration_number',
      header: 'Registration Number',
      render: (h) => <span className="font-mono text-sm">{(h as any).registration_number ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (h) => <Badge className={cn('capitalize', statusColor(h.status))}>{h.status}</Badge>,
    },
  ];

  // The top-right Review CTA — bright blue, with a badge showing pending count.
  const reviewButton = (
    <Button asChild variant="primary" className="relative">
      <Link to={ROUTES.ADMIN.APPROVE_HOTELS}>
        <LuShieldCheck className="h-4 w-4" /> Review Hotels
        {pendingCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/20 text-xs font-semibold">
            {pendingCount}
          </span>
        )}
      </Link>
    </Button>
  );

  return (
    <ResourceManager<Hotel>
      title="Hotels List"
      subtitle="Every property on Yatra. Approve new submissions from the Review Hotels page."
      entityName="hotel"
      data={hotels}
      columns={columns}
      loading={loading}
      searchKey="name"
      modalSize="xl"
      // Admins can still create hotels manually (rare — usually owners do this).
      canAdd={false}
      // Pass the Review button as the extra toolbar slot.
      toolbar={reviewButton}
      getId={(h) => h.id}
      getLabel={(h) => h.name}
      onRefresh={refresh}
      onDelete={async (h) => {
        const res = await dispatch(deleteHotelThunk(h.id));
        if (deleteHotelThunk.fulfilled.match(res)) toast.success('Hotel deleted');
      }}
      renderForm={({ editing, onDone }) => (
        <HotelForm editing={editing} onDone={onDone} variant="admin" />
      )}
    />
  );
}

/* Kept for backwards-compat with existing imports (router still maps to this).
   The actual UI lives in PendingHotelsPage now. */
export { PendingHotelsPage as ApproveHotelsPage } from './PendingHotelsPage';

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuArrowLeft, LuCheck, LuX, LuEye, LuBuilding2, LuMapPin, LuMail, LuPhone, LuClock,
} from 'react-icons/lu';
import { toast } from 'sonner';
import { Badge, Button, Spinner } from '@/components/atoms';
import { Modal } from '@/components/atoms/Modal';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { useAppDispatch } from '@/hooks';
import {
  updateHotelStatusThunk,
} from '@/features/thunks/hotelThunks';
import { hotelApi } from '@/api/hotel.api';
import { notificationApi } from '@/api/notification.api';
import { cn, formatDate, statusColor } from '@/lib/utils';
import { ROUTES } from '@/lib/constant';
import type { Hotel } from '@/types';

/**
 * Pending Hotel Reviews — admin only.
 *
 * Lists hotels with status="pending" (and a small audit tail of recently
 * decided ones), with one-click Approve/Reject buttons and a View Details
 * modal showing photos, owner info, and policies.
 *
 * Approve   → hotel.status = approved → owner notified, hotel appears publicly.
 * Reject    → hotel.status = rejected → owner notified, hotel stays hidden.
 */
export function PendingHotelsPage() {
  const dispatch = useAppDispatch();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [busy, setBusy] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<Hotel | null>(null);

  useEffect(() => {
    setLoading(true);
    hotelApi.manage(1, 200).then((res) => setHotels(res.data ?? [])).catch(() => toast.error('Failed to load hotels')).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? hotels : hotels.filter((h) => h.status === filter)),
    [hotels, filter],
  );

  const decide = async (h: Hotel, status: 'approved' | 'rejected') => {
    setBusy(h.id);
    try {
      const res = await dispatch(updateHotelStatusThunk({ id: h.id, status }));
      if (updateHotelStatusThunk.fulfilled.match(res)) {
        toast.success(`${h.name} ${status === 'approved' ? 'approved' : 'rejected'}`);
        // Best-effort notify the owner (non-blocking)
        notificationApi
          ?.createForUser?.({
            user_id: h.owner_id,
            type: status === 'approved' ? 'hotel_approved' : 'hotel_rejected',
            title: status === 'approved' ? 'Your property is live 🎉' : 'Property review update',
            message:
              status === 'approved'
                ? `${h.name} is approved and now visible to travelers.`
                : `${h.name} was not approved. Update your listing details and we'll review again.`,
          })
          .catch(() => undefined);
      }
    } finally {
      setBusy(null);
    }
  };

  const counts = useMemo(
    () => ({
      pending: hotels.filter((h) => h.status === 'pending').length,
      approved: hotels.filter((h) => h.status === 'approved').length,
      rejected: hotels.filter((h) => h.status === 'rejected').length,
      all: hotels.length,
    }),
    [hotels],
  );

  return (
    <div>
      <Breadcrumbs
        items={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Hotels', to: ROUTES.ADMIN.HOTELS }, { label: 'Pending reviews' }]}
        className="mb-4"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Pending Hotel Reviews</h1>
          <p className="text-text-2 dark:text-dark-text-2 mt-1">
            Approve owner-submitted properties before they go live, or reject with reason.
          </p>
        </div>
        <Button asChild variant="surface">
          <Link to={ROUTES.ADMIN.HOTELS}>
            <LuArrowLeft className="h-4 w-4" /> Back to hotels
          </Link>
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="inline-flex p-1 rounded-xl bg-surface-2 dark:bg-dark-surface-2 mb-5">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition',
              filter === f
                ? 'bg-surface dark:bg-dark-surface text-primary-600 shadow-sm'
                : 'text-text-2 dark:text-dark-text-2 hover:text-text dark:hover:text-dark-text',
            )}
          >
            {f}
            <span
              className={cn(
                'ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs',
                filter === f ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-surface dark:bg-dark-surface text-text-3',
              )}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center h-60"><Spinner size="lg" /></div>
      ) : visible.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border dark:border-dark-border">
          <LuBuilding2 className="h-10 w-10 text-text-3 mx-auto mb-3" />
          <p className="text-text-2 dark:text-dark-text-2">
            {filter === 'pending' ? 'No properties awaiting review — well done!' : `No ${filter} hotels.`}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-border dark:border-dark-border bg-surface dark:bg-dark-surface">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1.2fr_1.2fr_1fr_1.4fr] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-white bg-gradient-to-r from-primary-600 to-accent-600">
            <span>Hotel name</span>
            <span>Type</span>
            <span>Pan number</span>
            <span>Reg. number</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          <ul className="divide-y divide-border dark:divide-dark-border">
            {visible.map((h) => (
              <li
                key={h.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1.2fr_1.2fr_1fr_1.4fr] gap-2 md:gap-0 px-5 py-4 items-center hover:bg-surface-2 dark:hover:bg-dark-surface-2 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {h.logo ? (
                    <img src={h.logo} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 grid place-items-center shrink-0">
                      <LuBuilding2 className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{h.name}</p>
                    <p className="md:hidden text-xs text-text-3 capitalize">{h.type}</p>
                  </div>
                </div>
                <span className="hidden md:inline capitalize text-sm">{h.type}</span>
                <span className="hidden md:inline font-mono text-sm">{h.pan_number ?? '—'}</span>
                <span className="hidden md:inline font-mono text-sm truncate">{(h as any).registration_number ?? '—'}</span>
                <div>
                  <Badge className={cn('capitalize', statusColor(h.status))}>{h.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button size="sm" variant="outline" onClick={() => setPreviewing(h)}>
                    <LuEye className="h-4 w-4" /> View Details
                  </Button>
                  {h.status !== 'approved' && (
                    <Button
                      size="sm"
                      variant="success"
                      loading={busy === h.id}
                      onClick={() => decide(h, 'approved')}
                    >
                      <LuCheck className="h-4 w-4" /> Approve
                    </Button>
                  )}
                  {h.status !== 'rejected' && (
                    <Button
                      size="sm"
                      variant="danger"
                      loading={busy === h.id}
                      onClick={() => decide(h, 'rejected')}
                    >
                      <LuX className="h-4 w-4" /> Reject
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Details modal */}
      <Modal open={!!previewing} onClose={() => setPreviewing(null)} title="Property details" size="lg">
        {previewing && <HotelDetailsView hotel={previewing} />}
      </Modal>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
function HotelDetailsView({ hotel }: { hotel: Hotel }) {
  const photos = (hotel.photos ?? []).map((p: any) => p.url).filter(Boolean);
  const owner: any = (hotel as any).owner ?? {};
  const city: any = typeof hotel.city_id === 'object' ? hotel.city_id : null;

  return (
    <div className="space-y-5">
      {/* Header strip */}
      <div className="flex flex-wrap items-center gap-3">
        {hotel.logo && <img src={hotel.logo} alt="" className="h-16 w-16 rounded-lg object-cover" />}
        <div>
          <h3 className="font-display text-xl font-bold">{hotel.name}</h3>
          <p className="text-sm text-text-2 dark:text-dark-text-2 capitalize">{hotel.type}</p>
        </div>
        <Badge className={cn('capitalize ml-auto', statusColor(hotel.status))}>{hotel.status}</Badge>
      </div>

      {/* Owner & meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Field icon={<LuMapPin />} label="Location" value={`${hotel.address ?? '—'}${city ? `, ${city.name}` : ''}`} />
        <Field icon={<LuClock />} label="Submitted" value={formatDate((hotel as any).createdAt ?? (hotel as any).created_at)} />
        <Field icon={<LuMail />} label="Owner" value={owner.email ?? '—'} />
        <Field icon={<LuPhone />} label="Phone" value={hotel.phone ?? '—'} />
      </div>

      {/* PAN & registration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KV k="PAN number" v={hotel.pan_number ?? '—'} />
        <KV k="Registration number" v={(hotel as any).registration_number ?? '—'} />
      </div>

      {/* Description */}
      {hotel.description && (
        <div>
          <p className="text-xs font-medium text-text-3 uppercase tracking-wide mb-1">Description</p>
          <p className="text-sm text-text-2 dark:text-dark-text-2 whitespace-pre-line">{hotel.description}</p>
        </div>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div>
          <p className="text-xs font-medium text-text-3 uppercase tracking-wide mb-2">Photos ({photos.length})</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.slice(0, 8).map((url, i) => (
              <img key={i} src={url} alt="" className="aspect-square rounded-lg object-cover" />
            ))}
          </div>
        </div>
      )}

      {/* Facilities & rooms snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!!hotel.facilities?.length && (
          <div>
            <p className="text-xs font-medium text-text-3 uppercase tracking-wide mb-2">Facilities</p>
            <div className="flex flex-wrap gap-1">
              {hotel.facilities.map((f: any) => (
                <Badge key={typeof f === 'string' ? f : f.id} variant="default">
                  {typeof f === 'string' ? f : f.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {!!hotel.rooms?.length && (
          <div>
            <p className="text-xs font-medium text-text-3 uppercase tracking-wide mb-2">Rooms</p>
            <ul className="text-sm space-y-1">
              {hotel.rooms.map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{r.room_name} <span className="text-text-3">×{r.number_of_rooms}</span></span>
                  <span className="font-medium">NPR {r.base_price}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const Field = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <span className="h-8 w-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 grid place-items-center">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs text-text-3">{label}</p>
      <p className="font-medium truncate">{value}</p>
    </div>
  </div>
);

const KV = ({ k, v }: { k: string; v: string }) => (
  <div className="p-3 rounded-lg bg-surface-2 dark:bg-dark-surface-2">
    <p className="text-xs text-text-3">{k}</p>
    <p className="font-mono text-sm">{v}</p>
  </div>
);

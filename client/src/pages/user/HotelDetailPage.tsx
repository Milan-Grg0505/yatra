import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  LuMapPin, LuStar, LuUsers, LuBedDouble, LuWifi, LuSnowflake, LuTv, LuMartini,
  LuShieldCheck, LuClock, LuArrowRight, LuHeart, LuShare2,
} from 'react-icons/lu';
import { toast } from 'sonner';
import { Badge, Button, Input, Avatar, Rating, Spinner } from '@/components/atoms';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { HotelGallery } from '@/components/organisms/HotelGallery';
import { hotelApi } from '@/api/hotel.api';
import { reviewApi } from '@/api/review.api';
import { useAppSelector } from '@/hooks';
import { selectIsAuthenticated } from '@/features/slices/authSlice';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constant';
import type { Hotel, Review, Room } from '@/types';

const FEATURED_AMENITIES: Record<string, { icon: React.ReactNode; label: string }> = {
  has_wifi: { icon: <LuWifi />, label: 'Free WiFi' },
  has_ac: { icon: <LuSnowflake />, label: 'Air conditioning' },
  has_tv: { icon: <LuTv />, label: 'Flat-screen TV' },
  has_minibar: { icon: <LuMartini />, label: 'Minibar' },
};

export function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking widget state
  const [checkIn, setCheckIn] = useState(search.get('check_in') || todayPlus(1));
  const [checkOut, setCheckOut] = useState(search.get('check_out') || todayPlus(2));
  const [guests, setGuests] = useState<number>(Number(search.get('guests') || 2));
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [h, r] = await Promise.all([
          hotelApi.getById(id),
          reviewApi.forHotel(id).catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        setHotel((h as any)?.data ?? (h as any));
        setReviews(((r as any)?.data ?? []).slice(0, 6));
      } catch (e: any) {
        toast.error(e?.message ?? 'Could not load hotel');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const nights = useMemo(() => {
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
  }, [checkIn, checkOut]);

  const selectedRoom: Room | undefined = useMemo(
    () => hotel?.rooms?.find((r) => r.id === selectedRoomId),
    [hotel, selectedRoomId],
  );

  const subtotal = selectedRoom ? selectedRoom.base_price * nights : 0;
  const tax = subtotal * ((hotel?.tax_percentage ?? 13) / 100);
  const service = subtotal * ((hotel?.service_charge_percentage ?? 10) / 100);
  const total = subtotal + tax + service;

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to continue booking');
      navigate(`${ROUTES.LOGIN}?from=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (!selectedRoom) {
      toast.error('Pick a room first');
      return;
    }
    navigate(ROUTES.BOOKING_CHECKOUT, {
      state: {
        hotel,
        room: selectedRoom,
        checkIn,
        checkOut,
        guests,
        nights,
      },
    });
  };

  if (loading) {
    return <div className="grid place-items-center h-[60vh]"><Spinner size="lg" /></div>;
  }
  if (!hotel) {
    return <div className="text-center py-20">Hotel not found.</div>;
  }

  const photos = (hotel.photos ?? []).map((p: any) => p.url).filter(Boolean);
  if (hotel.logo) photos.unshift(hotel.logo);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs
        items={[
          { label: 'Hotels', to: ROUTES.HOTELS },
          { label: hotel.name },
        ]}
        className="mb-4"
      />

      {/* Title + meta */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" className="capitalize">{hotel.type}</Badge>
            <Rating value={hotel.average_review_rating ?? hotel.rating ?? 0} size={5} />
            <span className="text-xs text-text-3">({hotel.total_reviews ?? 0} reviews)</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{hotel.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-text-2 dark:text-dark-text-2 mt-1">
            <LuMapPin className="h-4 w-4 text-primary-600" />
            {hotel.address}{typeof hotel.city_id === 'object' ? `, ${hotel.city_id?.name}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><LuHeart className="h-4 w-4" /> Save</Button>
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied');
          }}>
            <LuShare2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {/* Gallery */}
      <HotelGallery images={photos} alt={hotel.name} />

      {/* Body: 2-col layout — content + sticky booking widget */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-8">
        <div className="space-y-10 min-w-0">
          {/* Description */}
          <section>
            <h2 className="font-display text-xl font-semibold mb-2">About this property</h2>
            <p className="text-text-2 dark:text-dark-text-2 leading-relaxed whitespace-pre-line">
              {hotel.description || 'No description provided.'}
            </p>
          </section>

          {/* Facilities */}
          {!!hotel.facilities?.length && (
            <section>
              <h2 className="font-display text-xl font-semibold mb-4">Most popular facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hotel.facilities.map((f: any) => (
                  <div key={typeof f === 'string' ? f : f.id} className="flex items-center gap-2 text-sm">
                    <LuShieldCheck className="h-4 w-4 text-primary-600" />
                    {typeof f === 'string' ? f : f.name}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rooms */}
          <section>
            <h2 className="font-display text-xl font-semibold mb-4">Available rooms</h2>
            {!hotel.rooms?.length ? (
              <p className="text-text-2">No rooms configured yet.</p>
            ) : (
              <div className="space-y-3">
                {hotel.rooms.map((r) => {
                  const selected = selectedRoomId === r.id;
                  return (
                    <div
                      key={r.id}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer ${selected
                        ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-900/10'
                        : 'border-border dark:border-dark-border hover:border-primary-400'
                        }`}
                      onClick={() => setSelectedRoomId(r.id)}
                    >
                      <div className="flex flex-wrap items-start gap-3 justify-between">
                        <div className="flex-1 min-w-[200px]">
                          <p className="font-semibold">{r.room_name}</p>
                          <p className="text-xs text-text-3 capitalize">
                            {r.room_type} • {r.bed_type} bed
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-2">
                            <span className="inline-flex items-center gap-1"><LuUsers className="h-3 w-3" />{r.max_guest} guests</span>
                            <span className="inline-flex items-center gap-1"><LuBedDouble className="h-3 w-3" />{r.number_of_beds} beds</span>
                            {Object.entries(FEATURED_AMENITIES).map(([k, v]) =>
                              (r as any)[k] ? (
                                <span key={k} className="inline-flex items-center gap-1">
                                  <span className="h-3 w-3">{v.icon}</span>{v.label}
                                </span>
                              ) : null,
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-3">per night</p>
                          <p className="font-display text-xl font-bold text-primary-600">{formatCurrency(r.base_price)}</p>
                          <Button size="sm" variant={selected ? 'primary' : 'outline'} className="mt-2">
                            {selected ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Policies */}
          {!!hotel.policies?.length && (
            <section>
              <h2 className="font-display text-xl font-semibold mb-4">House rules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PolicyRow icon={<LuClock />} title="Check-in" value={String(hotel.check_in_time)} />
                <PolicyRow icon={<LuClock />} title="Check-out" value={String(hotel.check_out_time)} />
                {hotel.policies.map((p: any) => (
                  <div key={p.id} className="p-3 rounded-lg bg-surface-2 dark:bg-dark-surface-2">
                    <p className="font-medium text-sm">{p.title}</p>
                    {p.description && <p className="text-xs text-text-3 mt-0.5">{p.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="font-display text-xl font-semibold mb-4">Guest reviews</h2>
            {!reviews.length ? (
              <p className="text-text-2">No reviews yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={(r as any).user?.name ?? 'Guest'} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{(r as any).user?.name ?? 'Guest'}</p>
                        <p className="text-xs text-text-3">{formatDate(r.createdAt)}</p>
                      </div>
                      <Rating value={r.rating} size={4} className="ml-auto" />
                    </div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-sm text-text-2 dark:text-dark-text-2 mt-1 line-clamp-4">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sticky booking widget */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="p-5 rounded-2xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface shadow-card space-y-3">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl font-bold text-primary-600">
                {formatCurrency(selectedRoom?.base_price ?? hotel.rooms?.[0]?.base_price ?? 0)}
              </span>
              <span className="text-sm text-text-3">/ night</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input label="Check-in" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              <Input label="Check-out" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <Input label="Guests" type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />

            {selectedRoom ? (
              <div className="text-sm space-y-1 pt-2 border-t border-border dark:border-dark-border">
                <Row label={`${formatCurrency(selectedRoom.base_price)} × ${nights} nights`} value={formatCurrency(subtotal)} />
                <Row label={`Tax (${hotel.tax_percentage ?? 13}%)`} value={formatCurrency(tax)} />
                <Row label={`Service (${hotel.service_charge_percentage ?? 10}%)`} value={formatCurrency(service)} />
                <Row label="Total" value={formatCurrency(total)} bold />
              </div>
            ) : (
              <p className="text-xs text-text-3 pt-2 border-t border-border dark:border-dark-border">
                Select a room above to see the full price.
              </p>
            )}

            <Button fullWidth size="lg" onClick={handleBook}>
              {selectedRoom ? 'Reserve' : 'Pick a room'} <LuArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-text-3 text-center">You won't be charged yet</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PolicyRow({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-surface-2 dark:bg-dark-surface-2 flex items-start gap-2">
      <span className="text-primary-600 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-text-3">{title}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold pt-2 border-t border-border dark:border-dark-border' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

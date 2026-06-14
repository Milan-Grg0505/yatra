import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LuBedDouble, LuBuilding2, LuArrowRight, LuTriangleAlert,
  LuCircleX, LuMailWarning, LuBadgeCheck,
} from 'react-icons/lu';
import { toast } from 'sonner';
import { Badge, Button, Spinner } from '@/components/atoms';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAuth } from '@/features/slices/authSlice';
import { selectHotel } from '@/features/slices/hotelSlice';
import { fetchMyHotelsThunk, deleteHotelThunk } from '@/features/thunks/hotelThunks';
import { authApi } from '@/api/auth.api';
import { cn, statusColor } from '@/lib/utils';
import { ROUTES } from '@/lib/constant';

/**
 * Owner home — one hotel per owner.
 *
 * UX states:
 *  1. Owner NOT verified yet  → "Awaiting account approval" banner (cannot list)
 *  2. Verified, NO hotel       → big "Register your property" CTA
 *  3. Hotel pending             → status banner + property card
 *  4. Hotel rejected            → red banner with "Edit & resubmit" CTA
 *  5. Hotel approved            → normal management card
 */
export function OwnerHotelsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { myHotels, loading } = useAppSelector(selectHotel);

  useEffect(() => { dispatch(fetchMyHotelsThunk()); }, [dispatch]);

  if (loading) return <div className="grid place-items-center h-[60vh]"><Spinner size="lg" /></div>;

  const hotel = myHotels[0];
  const emailVerified = !!user?.is_email_verified;
  const approved = user?.is_approved === true;
  const pendingApproval = user?.is_approved == null;
  const rejected = user?.is_approved === false;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Owner dashboard', to: ROUTES.OWNER.DASHBOARD }, { label: 'My property' }]} className="mb-4" />

      {/* ───────────── NOT APPROVED BY ADMIN ───────────── */}
      {!approved && (
        <div className="rounded-2xl bg-warning/5 border border-warning/30 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="h-12 w-12 rounded-full bg-warning/15 text-warning grid place-items-center shrink-0">
              <LuMailWarning className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">
                {rejected ? 'Registration rejected' : 'Awaiting admin approval'}
              </h2>
              <p className="text-sm text-text-2 dark:text-dark-text-2 mt-1">
                {rejected
                  ? 'Your owner account registration was not approved by the admin. Please contact support for further assistance.'
                  : emailVerified
                    ? 'Your email is verified. Please wait for an admin to approve your owner account before you can list a property.'
                    : <>Your owner account needs to be verified before you can list a property. We sent a 6-digit code to <span className="font-medium">{user?.email}</span> — verify it, or wait for an admin to approve you manually.</>
                }
              </p>
              {!emailVerified && !rejected && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link to={`${ROUTES.VERIFY_OTP}`} state={{ email: user?.email, type: 'verification' }}>
                      Enter verification code
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await authApi.sendOtp({ email: user!.email, type: 'verification' });
                        toast.success('A new code is on its way to your inbox');
                      } catch (e: any) {
                        toast.error(e?.message ?? 'Could not send code');
                      }
                    }}
                  >
                    Resend code
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────── APPROVED, NO HOTEL ───────────── */}
      {approved && !hotel && (
        <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 sm:p-12 relative overflow-hidden">
          <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 bg-accent-500/30 rounded-full blur-3xl" />
          <div className="relative max-w-2xl">
            <Badge variant="accent" className="mb-3 inline-flex items-center gap-1">
              <LuBadgeCheck className="h-3 w-3" /> Approved owner
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              List your property on Yatra
            </h1>
            <p className="mt-3 text-white/85">
              Reach thousands of travelers across Nepal. Adding your property takes about 5 minutes.
              You can edit details, pricing, and rooms anytime after submitting.
            </p>
            <Button asChild variant="accent" size="xl" className="mt-6">
              <Link to={ROUTES.OWNER.REGISTER_PROPERTY}>
                Register your property <LuArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* ───────────── 3/4/5. WITH HOTEL ───────────── */}
      {approved && hotel && (
        <div className="space-y-6">
          {hotel.status === 'pending' && (
            <StatusBanner
              variant="warning"
              icon={<LuTriangleAlert className="h-5 w-5" />}
              title="Pending admin approval"
              body="Your property is under review. You'll get a notification once it's approved and visible to travelers."
            />
          )}
          {hotel.status === 'rejected' && (
            <StatusBanner
              variant="danger"
              icon={<LuCircleX className="h-5 w-5" />}
              title="Property not approved"
              body="An admin reviewed your submission and didn't approve it. Update the listing details and resubmit for review."
              action={
                <Button variant="danger" size="sm" asChild>
                  <Link to={ROUTES.OWNER.HOTEL_ROOMS(hotel.id)}>Edit listing</Link>
                </Button>
              }
            />
          )}

          <div className="rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border overflow-hidden">
            <div className="grid sm:grid-cols-[200px_1fr] gap-4">
              {hotel.logo ? (
                <img src={hotel.logo} alt={hotel.name} className="h-44 sm:h-full w-full object-cover" />
              ) : (
                <div className="h-44 sm:h-full grid place-items-center bg-surface-2 dark:bg-dark-surface-2">
                  <LuBuilding2 className="h-10 w-10 text-text-3" />
                </div>
              )}
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-bold">{hotel.name}</h2>
                    <p className="text-sm text-text-2 dark:text-dark-text-2 mt-1 capitalize">
                      {hotel.type} • {hotel.address}
                    </p>
                  </div>
                  <Badge className={cn('capitalize', statusColor(hotel.status))}>{hotel.status}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
                  <Stat label="Bookings" value={hotel.booking_count ?? 0} />
                  <Stat label="Reviews" value={hotel.total_reviews ?? 0} />
                  <Stat label="Rating" value={(hotel.average_review_rating ?? 0).toFixed(1)} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link to={ROUTES.OWNER.HOTEL_ROOMS(hotel.id)}>
                      <LuBedDouble className="h-4 w-4" /> Manage rooms
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm(`Delete ${hotel.name}? This cannot be undone.`)) return;
                      const res = await dispatch(deleteHotelThunk(hotel.id));
                      if (deleteHotelThunk.fulfilled.match(res)) toast.success('Hotel deleted');
                    }}
                  >
                    Remove listing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function StatusBanner({
  variant, icon, title, body, action,
}: {
  variant: 'warning' | 'danger' | 'success';
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const styles = {
    warning: 'bg-warning/10 border-warning/30 text-warning',
    danger: 'bg-danger/10 border-danger/30 text-danger',
    success: 'bg-success/10 border-success/30 text-success',
  }[variant];
  return (
    <div className={cn('p-4 rounded-2xl border flex items-start gap-3', styles)}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-text dark:text-dark-text">{title}</p>
        <p className="text-xs text-text-2 dark:text-dark-text-2 mt-0.5">{body}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-3 rounded-lg bg-surface-2 dark:bg-dark-surface-2">
      <p className="text-xs text-text-3">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}

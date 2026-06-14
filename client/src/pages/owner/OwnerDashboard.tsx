import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuHotel, LuTicket, LuStar, LuTrendingUp, LuArrowRight, LuMailWarning } from 'react-icons/lu';
import { StatCard } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useAppSelector } from '@/hooks';
import { selectAuth } from '@/features/slices/authSlice';
import { formatCurrency } from '@/lib/utils';
import { ROUTES } from '@/lib/constant';
import { MOCK_BOOKINGS, MOCK_MY_HOTELS } from '@/lib/mock-data';

export function OwnerDashboard() {
  const { user } = useAppSelector(selectAuth);
  const approved = user?.is_approved === true;
  const rejected = user?.is_approved === false;
  // const dispatch = useAppDispatch();
  // const { myHotels } = useAppSelector(selectHotel);
  // const { bookings } = useAppSelector(selectBooking);

  // useEffect(() => {
  //   dispatch(fetchMyHotelsThunk());
  //   dispatch(fetchBookingsThunk(undefined));
  // }, [dispatch]);

  // const revenue = bookings.filter((b) => b.payment_status === 'paid').reduce((sum, b) => sum + b.total_price, 0);
  // const avgRating = myHotels.reduce((s, h) => s + (h.average_review_rating || 0), 0) / (myHotels.length || 1);
  const [myHotels, setMyHotels] = useState(MOCK_MY_HOTELS);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMyHotels(MOCK_MY_HOTELS);
      setBookings(MOCK_BOOKINGS);
      setLoading(false);
    };
    fetchData();
  }, []);

  const revenue = bookings
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.total_price, 0);

  const avgRating = myHotels.length > 0
    ? myHotels.reduce((s, h) => s + (h.average_review_rating || 0), 0) / myHotels.length
    : 0;


  if (!approved) {
    return (
      <div className="rounded-2xl bg-warning/5 border border-warning/30 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="h-12 w-12 rounded-full bg-warning/15 text-warning grid place-items-center shrink-0">
            <LuMailWarning className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold">
              {rejected ? 'Registration rejected' : 'Not yet approved'}
            </h2>
            <p className="text-sm text-text-2 dark:text-dark-text-2 mt-1">
              {rejected
                ? 'Your owner account registration was not approved. Please contact support.'
                : 'Your owner account is pending admin approval. You will be able to access the dashboard once approved.'}
            </p>
            <Button asChild className="mt-4">
              <Link to={ROUTES.OWNER.HOTELS}>
                View status <LuArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Owner Dashboard</h1>
      <p className="text-text-2 mt-1">Overview of your properties</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard icon={<LuHotel className="h-5 w-5" />} label="My hotels" value={myHotels.length} />
        <StatCard icon={<LuTicket className="h-5 w-5" />} label="Total bookings" value={bookings.length} />
        <StatCard icon={<LuTrendingUp className="h-5 w-5" />} label="Revenue" value={formatCurrency(revenue)} />
        <StatCard icon={<LuStar className="h-5 w-5" />} label="Avg rating" value={avgRating.toFixed(1)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="p-5 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border">
          <h3 className="font-semibold mb-4">Recent bookings</h3>
          {bookings.slice(0, 5).map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2 border-b border-border dark:border-dark-border last:border-0">
              <span className="text-sm">{typeof b.hotel_id === 'object' ? b.hotel_id.name : 'Hotel'}</span>
              <span className="text-sm font-medium">{formatCurrency(b.total_price)}</span>
            </div>
          ))}
        </div>
        <div className="p-5 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border">
          <h3 className="font-semibold mb-4">My properties</h3>
          {myHotels.slice(0, 5).map((h) => (
            <div key={h.id} className="flex items-center justify-between py-2 border-b border-border dark:border-dark-border last:border-0">
              <span className="text-sm">{h.name}</span>
              <span className="text-xs text-text-3 capitalize">{h.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

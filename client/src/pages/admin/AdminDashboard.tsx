import { useEffect, useState } from 'react';
import { LuUsers, LuHotel, LuTicket, LuTrendingUp } from 'react-icons/lu';
import { StatCard } from '@/components/molecules';
import { userApi } from '@/api/user.api';
// import { hotelApi } from '@/api/hotel.api';
// import { bookingApi } from '@/api/booking.api';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, hotels: 0, bookings: 0, revenue: 0 });
  const [chartData, setChartData] = useState<Array<{ date: string; bookings: number }>>([]);

  // useEffect(() => {
  //   Promise.all([userApi.listAll(), hotelApi.list(1, 1000), bookingApi.list()]).then(([u, h, b]) => {
  //     const bookings = b.data ?? [];
  //     setStats({
  //       users: u.data?.length ?? 0,
  //       hotels: h.data?.length ?? 0,
  //       bookings: bookings.length,
  //       revenue: bookings.filter((x) => x.payment_status === 'paid').reduce((s, x) => s + x.total_price, 0),
  //     });

  //     const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
  //     setChartData(
  //       days.map((d) => ({
  //         date: format(d, 'MMM dd'),
  //         bookings: bookings.filter((x) => format(new Date(x.createdAt), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).length,
  //       })),
  //     );
  //   });
  // }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Admin overview</h1>
      <p className="text-text-2 mt-1">System-wide statistics</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard icon={<LuUsers className="h-5 w-5" />} label="Total users" value={stats.users} />
        <StatCard icon={<LuHotel className="h-5 w-5" />} label="Total hotels" value={stats.hotels} />
        <StatCard icon={<LuTicket className="h-5 w-5" />} label="Total bookings" value={stats.bookings} />
        <StatCard icon={<LuTrendingUp className="h-5 w-5" />} label="Revenue" value={formatCurrency(stats.revenue)} />
      </div>
      <div className="mt-8 p-5 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border">
        <h3 className="font-semibold mb-4">Booking activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" stroke="currentColor" fontSize={10} />
            <YAxis stroke="currentColor" fontSize={10} />
            <Tooltip />
            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

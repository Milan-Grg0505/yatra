// import { useEffect, useState } from 'react';
// import { toast } from 'sonner';
// import { Avatar, Badge, Select } from '@/components/atoms';
// import { DataTable, type Column } from '@/components/molecules/DataTable';
// import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
// import { bookingApi } from '@/api/booking.api';
// import { cn, formatCurrency, formatDate } from '@/lib/utils';
// import type { Booking } from '@/types';

// const STATUS_OPTIONS = [
//   { value: 'pending', label: 'Pending' },
//   { value: 'confirmed', label: 'Confirmed' },
//   { value: 'completed', label: 'Completed' },
//   { value: 'canceled', label: 'Canceled' },
// ];

// const STATUS_COLOR: Record<string, string> = {
//   confirmed: 'success',
//   pending: 'warning',
//   canceled: 'danger',
//   completed: 'primary',
// };

// const PAY_COLOR: Record<string, string> = {
//   paid: 'success',
//   pending: 'warning',
//   failed: 'danger',
//   refunded: 'default',
// };

// export function AdminBookingsPage() {
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState<string | null>(null);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const r = await bookingApi.list();
//       setBookings((r as any).data ?? []);
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => { load(); }, []);

//   const updateStatus = async (b: Booking, next: string) => {
//     if (next === b.status) return;
//     setUpdating(b.id);
//     try {
//       // We have a `cancel` endpoint for the canceled state; everything else goes through
//       // the backend's update flow (PUT /bookings/updateStatus exposed for admin/owner).
//       if (next === 'canceled') {
//         await bookingApi.cancel(b.id, { reason: 'Cancelled by admin' });
//       } else {
//         // We piggyback the payment-status endpoint, which also nudges the booking.
//         // If your API exposes a dedicated PATCH /bookings/{id}/status, swap it here.
//         await bookingApi.updateStatus?.(b.id, { status: next });
//       }
//       toast.success('Booking updated');
//       // Optimistic refresh
//       setBookings((prev) => prev.map((row) => (row.id === b.id ? { ...row, status: next as any } : row)));
//     } catch (e: any) {
//       toast.error(e?.message ?? 'Could not update booking');
//     } finally {
//       setUpdating(null);
//     }
//   };

//   const columns: Column<Booking>[] = [
//     {
//       key: 'id',
//       header: 'Booking',
//       render: (b) => (
//         <div>
//           <p className="font-mono text-xs">{String(b.id).slice(-8).toUpperCase()}</p>
//           <p className="text-xs text-text-3">{formatDate((b as any).createdAt ?? (b as any).created_at)}</p>
//         </div>
//       ),
//     },
//     {
//       key: 'user_id',
//       header: 'Guest',
//       render: (b) => {
//         const u = (b as any).user ?? {};
//         return (
//           <div className="flex items-center gap-2 min-w-[140px]">
//             <Avatar name={u.name ?? 'Guest'} size="sm" />
//             <div className="min-w-0">
//               <p className="text-sm font-medium truncate">{u.name ?? '—'}</p>
//               <p className="text-xs text-text-3 truncate">{u.email ?? '—'}</p>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       key: 'hotel_id',
//       header: 'Hotel',
//       render: (b) => (b as any).hotel?.name ?? '—',
//     },
//     {
//       key: 'check_in',
//       header: 'Dates',
//       render: (b) => (
//         <div className="text-xs">
//           <p>{formatDate(b.check_in)}</p>
//           <p className="text-text-3">→ {formatDate(b.check_out)}</p>
//         </div>
//       ),
//     },
//     {
//       key: 'total_price',
//       header: 'Total',
//       render: (b) => <span className="font-semibold">{formatCurrency(b.total_price)}</span>,
//     },
//     {
//       key: 'payment_status',
//       header: 'Payment',
//       render: (b) => (
//         <Badge variant={PAY_COLOR[b.payment_status] as any}>{b.payment_status}</Badge>
//       ),
//     },
//     {
//       key: 'status',
//       header: 'Status',
//       render: (b) => (
//         <Select
//           value={b.status}
//           onChange={(e) => updateStatus(b, e.target.value)}
//           disabled={updating === b.id}
//           options={STATUS_OPTIONS}
//           className={cn('w-36 capitalize', `border-${STATUS_COLOR[b.status]}-300`)}
//         />
//       ),
//     },
//   ];

//   return (
//     <div>
//       <Breadcrumbs items={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Bookings' }]} className="mb-4" />
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="font-display text-3xl font-bold">Bookings</h1>
//           <p className="text-text-2 mt-1">All reservations across the platform. Change status inline.</p>
//         </div>
//       </div>
//       <DataTable data={bookings} columns={columns} loading={loading} searchKey="status" emptyMessage="No bookings yet" />
//     </div>
//   );
// }

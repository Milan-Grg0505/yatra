// import { useEffect, useState } from 'react';
// import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
// import { LuCircleCheck, LuCircleX, LuArrowRight } from 'react-icons/lu';
// import { Button, Spinner } from '@/components/atoms';
// import { bookingApi } from '@/api/booking.api';
// import { ROUTES } from '@/lib/constants';

// type Phase = 'verifying' | 'success' | 'failure';

// /**
//  * Single page handles the redirect/callback from both eSewa and Khalti.
//  * Route: /payment/:provider/return?transaction_uuid=…&status=…
//  *
//  * - eSewa: redirects back with `?data=<base64-json>` containing transaction_uuid + status
//  * - Khalti: redirects back with `?pidx=…&status=Completed&txnId=…&amount=…`
//  *
//  * We normalize both into our backend's `PaymentStatusUpdate` shape.
//  */
// export function PaymentReturnPage() {
//   const { provider } = useParams<{ provider: 'esewa' | 'khalti' }>();
//   const navigate = useNavigate();
//   const { search } = useLocation();
//   const [phase, setPhase] = useState<Phase>('verifying');
//   const [message, setMessage] = useState<string>('Verifying your payment…');

//   useEffect(() => {
//     (async () => {
//       try {
//         const params = new URLSearchParams(search);
//         let txnUuid: string | undefined;
//         let status: string | undefined;
//         let refId: string | undefined;

//         if (provider === 'esewa') {
//           // eSewa v2: returns a base64-encoded JSON in `?data=`
//           const data = params.get('data');
//           if (data) {
//             try {
//               const decoded = JSON.parse(atob(data));
//               txnUuid = decoded.transaction_uuid;
//               status = decoded.status; // COMPLETE | PENDING | FAILED
//               refId = decoded.transaction_code;
//             } catch {
//               // Older eSewa format passes plain params
//               txnUuid = params.get('oid') ?? params.get('transaction_uuid') ?? undefined;
//               status = params.get('status') ?? 'COMPLETE';
//               refId = params.get('refId') ?? undefined;
//             }
//           }
//         } else if (provider === 'khalti') {
//           txnUuid = params.get('pidx') ?? undefined;
//           status = params.get('status') ?? 'Completed';
//           refId = params.get('transaction_id') ?? params.get('txnId') ?? undefined;
//         }

//         if (!txnUuid) {
//           setPhase('failure');
//           setMessage('We could not find your payment reference. If you were charged, contact support.');
//           return;
//         }

//         await bookingApi.updatePaymentStatus({
//           transaction_uuid: txnUuid,
//           status,
//           ref_id: refId,
//         });

//         const ok = /complete|success|paid/i.test(status ?? '');
//         setPhase(ok ? 'success' : 'failure');
//         setMessage(
//           ok
//             ? 'Your booking is confirmed. We sent the details to your email.'
//             : 'Payment was not completed. No charge was made — feel free to try again.',
//         );
//       } catch (e: any) {
//         setPhase('failure');
//         setMessage(e?.message ?? 'Payment verification failed');
//       }
//     })();
//   }, [provider, search]);

//   return (
//     <div className="min-h-[70vh] grid place-items-center px-4 py-12">
//       <div className="w-full max-w-md text-center bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-8 shadow-card">
//         {phase === 'verifying' && (
//           <>
//             <Spinner size="lg" className="mx-auto" />
//             <h2 className="mt-4 font-display text-xl font-semibold">{message}</h2>
//             <p className="text-sm text-text-2 dark:text-dark-text-2 mt-2">This usually takes a few seconds.</p>
//           </>
//         )}

//         {phase === 'success' && (
//           <>
//             <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-4">
//               <LuCircleCheck className="h-9 w-9" />
//             </div>
//             <h2 className="font-display text-2xl font-bold">Booking confirmed 🎉</h2>
//             <p className="text-text-2 dark:text-dark-text-2 mt-2">{message}</p>
//             <div className="mt-6 flex flex-col gap-2">
//               <Button asChild fullWidth size="lg"><Link to={ROUTES.MY_BOOKINGS}>View my bookings <LuArrowRight className="h-4 w-4" /></Link></Button>
//               <Button asChild variant="ghost" fullWidth><Link to={ROUTES.HOME}>Back to home</Link></Button>
//             </div>
//           </>
//         )}

//         {phase === 'failure' && (
//           <>
//             <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger mb-4">
//               <LuCircleX className="h-9 w-9" />
//             </div>
//             <h2 className="font-display text-2xl font-bold">Payment didn't go through</h2>
//             <p className="text-text-2 dark:text-dark-text-2 mt-2">{message}</p>
//             <div className="mt-6 flex flex-col gap-2">
//               <Button asChild fullWidth size="lg"><Link to={ROUTES.MY_BOOKINGS}>Go to my bookings</Link></Button>
//               <Button asChild variant="ghost" fullWidth><Link to={ROUTES.HOTELS}>Browse hotels</Link></Button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

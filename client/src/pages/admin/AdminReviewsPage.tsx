import { useEffect, useState } from 'react';
import { LuCheck, LuX } from 'react-icons/lu';
import { toast } from 'sonner';
import { Button } from '@/components/atoms';
import { ReviewCard } from '@/components/molecules';
import { reviewApi } from '@/api/review.api';
import { useAppSelector } from '@/hooks';
import { selectHotel } from '@/features/slices/hotelSlice';
import type { Review } from '@/types';

export function AdminReviewsPage() {
  const { hotels } = useAppSelector(selectHotel);
  const [reviews, setReviews] = useState<Review[]>([]);

  const load = async () => {
    const all = await Promise.all(hotels.slice(0, 50).map((h) => reviewApi.forHotel(h.id, 1, 50)));
    setReviews(all.flatMap((r) => r.data ?? []));
  };

  useEffect(() => { if (hotels.length) load(); }, [hotels]);

  const update = async (id: string, status: 'approved' | 'rejected') => {
    await reviewApi.setStatus(id, status);
    toast.success(`Review ${status}`);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Moderate reviews</h1>
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-text-3 text-center py-12">No reviews to moderate</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="relative">
              <ReviewCard review={r} />
              <div className="flex gap-2 mt-2 ml-16">
                <Button size="sm" variant="primary" onClick={() => update(r.id, 'approved')}>
                  <LuCheck className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => update(r.id, 'rejected')}>
                  <LuX className="h-3.5 w-3.5" /> Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

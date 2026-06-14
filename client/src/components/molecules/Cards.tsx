import { Link } from 'react-router-dom';
import { LuCalendarDays, LuUsers, LuMapPin, LuMessageSquare } from 'react-icons/lu';
import { Badge, Rating, Avatar } from '@/components/atoms';
import { cn, formatCurrency, timeAgo, difficultyColor } from '@/lib/utils';
import { FALLBACK_IMAGE, ROUTES } from '@/lib/constant';
import type { TravelPackage, Review } from '@/types';

/* ---------- PackageCard ---------- */
export function PackageCard({ pkg }: { pkg: TravelPackage }) {
  const hasDiscount = pkg.discount_price !== undefined && pkg.discount_price < pkg.price_per_person;
  return (
    <Link
      to={ROUTES.TRAVEL_PACKAGE_DETAIL(pkg.id)}
      className="group block rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border overflow-hidden hover:shadow-elevated hover:-translate-y-1 transition-all"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={pkg.featured_image ?? FALLBACK_IMAGE}
          alt={pkg.name}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <Badge className={cn('absolute top-3 left-3 capitalize backdrop-blur', difficultyColor(pkg.difficulty_level))}>
          {pkg.difficulty_level}
        </Badge>
        {hasDiscount && (
          <Badge variant="accent" className="absolute top-3 right-3">
            Save {Math.round(((pkg.price_per_person - pkg.discount_price!) / pkg.price_per_person) * 100)}%
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-text dark:text-dark-text line-clamp-1">{pkg.name}</h3>
        <div className="flex items-center gap-3 text-xs text-text-2 mt-2">
          <span className="flex items-center gap-1">
            <LuCalendarDays className="h-3.5 w-3.5" />
            {pkg.duration_days}D / {pkg.duration_nights}N
          </span>
          <span className="flex items-center gap-1">
            <LuUsers className="h-3.5 w-3.5" />
            {pkg.group_size_min}–{pkg.group_size_max}
          </span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Rating value={pkg.average_rating} size={14} />
          <div className="text-right">
            {hasDiscount && (
              <span className="text-xs text-text-3 line-through mr-1">{formatCurrency(pkg.price_per_person)}</span>
            )}
            <span className="text-base font-bold text-primary-600">
              {formatCurrency(pkg.discount_price ?? pkg.price_per_person)}
            </span>
            <p className="text-xs text-text-3">per person</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ---------- ReviewCard ---------- */
export function ReviewCard({
  review,
  onHelpful,
  ownerView = false,
  onRespond,
}: {
  review: Review;
  onHelpful?: (id: string) => void;
  ownerView?: boolean;
  onRespond?: (id: string) => void;
}) {
  const user = typeof review.user_id === 'object' ? review.user_id : null;
  return (
    <div className="rounded-2xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface p-5">
      <div className="flex items-start gap-3">
        <Avatar src={user?.image} name={user?.name ?? 'User'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-text dark:text-dark-text">{user?.name ?? 'Anonymous'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Rating value={review.rating} size={14} />
                <span className="text-xs text-text-3">{timeAgo(review.createdAt)}</span>
                {review.sentiment && (
                  <Badge variant={review.sentiment === 'positive' ? 'success' : review.sentiment === 'negative' ? 'danger' : 'default'}>
                    {review.sentiment}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <h4 className="font-semibold mt-3 text-text dark:text-dark-text">{review.title}</h4>
          <p className="text-sm text-text-2 dark:text-dark-text-2 mt-1 leading-relaxed">{review.comment}</p>
          {review.images?.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {review.images.map((img) => (
                <img key={img} src={img} alt="Review" className="h-20 w-28 object-cover rounded-lg" loading="lazy" />
              ))}
            </div>
          )}
          {review.owner_response && (
            <div className="mt-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500">
              <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-1">Owner response</p>
              <p className="text-sm text-text-2 dark:text-dark-text-2">{review.owner_response}</p>
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs">
            {onHelpful && (
              <button
                onClick={() => onHelpful(review.id)}
                className="flex items-center gap-1 text-text-2 hover:text-primary-600 transition"
              >
                👍 Helpful ({review.helpful_count})
              </button>
            )}
            {ownerView && !review.owner_response && onRespond && (
              <button
                onClick={() => onRespond(review.id)}
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
              >
                <LuMessageSquare className="h-3.5 w-3.5" /> Respond
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- StatCard ---------- */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: { direction: 'up' | 'down'; value: string };
  className?: string;
}
export function StatCard({ icon, label, value, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border hover:shadow-card transition',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-2 dark:text-dark-text-2">{label}</p>
        <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">{icon}</div>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold text-text dark:text-dark-text">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium pb-1',
              trend.direction === 'up' ? 'text-success' : 'text-danger',
            )}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Destination card ---------- */
export function DestinationCard({ name, image, count, onClick }: { name: string; image?: string; count: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl text-left"
    >
      <img src={image ?? FALLBACK_IMAGE} alt={name} className="h-full w-full object-cover group-hover:scale-110 transition duration-700" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="text-lg font-bold flex items-center gap-1">
          <LuMapPin className="h-4 w-4" />
          {name}
        </h3>
        <p className="text-xs text-white/80 mt-0.5">{count} hotels</p>
      </div>
    </button>
  );
}

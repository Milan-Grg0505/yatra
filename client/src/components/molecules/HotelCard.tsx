import { Link } from 'react-router-dom';
import { LuMapPin, LuHeart, LuStar } from 'react-icons/lu';
import { Badge, Rating } from '@/components/atoms';
import { cn, formatCurrency } from '@/lib/utils';
import { FALLBACK_IMAGE, ROUTES } from '@/lib/constant';
import type { Hotel } from '@/types';

interface HotelCardProps {
  hotel: Hotel;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: string) => void;
  variant?: 'grid' | 'list';
}

export function HotelCard({ hotel, isWishlisted, onWishlistToggle, variant = 'grid' }: HotelCardProps) {
  const rooms = (hotel as any).rooms as Array<{ base_price: number }> | undefined;
  const lowestPrice = rooms?.length ? Math.min(...rooms.map((r) => r.base_price)) : null;
  const photos = (hotel as any).photos as Array<{ url: string }> | undefined;
  const coverImage = photos?.[0]?.url ?? hotel.logo ?? FALLBACK_IMAGE;
  const cityName = typeof hotel.city_id === 'object' ? hotel.city_id?.name : '';

  if (variant === 'list') {
    return (
      <Link
        to={ROUTES.HOTEL_DETAIL(hotel.id)}
        className="group flex gap-4 p-3 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border hover:shadow-card hover:border-primary-200 dark:hover:border-primary-700 transition-all"
      >
        <div className="relative shrink-0 w-56 h-44 rounded-xl overflow-hidden">
          <img src={coverImage} alt={hotel.name} className="h-full w-full object-cover group-hover:scale-105 transition" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-text dark:text-dark-text">{hotel.name}</h3>
              <p className="text-sm text-text-2 dark:text-dark-text-2 flex items-center gap-1 mt-1">
                <LuMapPin className="h-3.5 w-3.5" />
                {cityName} {hotel.address && `· ${hotel.address}`}
              </p>
            </div>
            {onWishlistToggle && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onWishlistToggle(hotel.id);
                }}
                className="p-2 rounded-full hover:bg-surface-2 dark:hover:bg-dark-surface-2"
              >
                <LuHeart className={cn('h-5 w-5', isWishlisted ? 'fill-danger text-danger' : 'text-text-3')} />
              </button>
            )}
          </div>
          <p className="text-sm text-text-2 dark:text-dark-text-2 mt-2 line-clamp-2">{hotel.description}</p>
          <div className="flex-1" />
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-center gap-2">
              <Rating value={hotel.average_review_rating || hotel.rating} size={14} />
              <span className="text-xs text-text-2">({hotel.total_reviews})</span>
            </div>
            {lowestPrice !== null && (
              <div className="text-right">
                <div className="text-xs text-text-2">From</div>
                <div className="text-lg font-bold text-primary-600">{formatCurrency(lowestPrice)}</div>
                <div className="text-xs text-text-3">per night</div>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={ROUTES.HOTEL_DETAIL(hotel.id)}
      className="group block rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border overflow-hidden hover:shadow-elevated hover:-translate-y-1 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={coverImage} alt={hotel.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        {hotel.average_review_rating > 4 && (
          <Badge variant="primary" className="absolute top-3 left-3 bg-surface/95 backdrop-blur shadow">
            <LuStar className="h-3 w-3 fill-accent-500 text-accent-500" />
            {hotel.average_review_rating.toFixed(1)}
          </Badge>
        )}
        {onWishlistToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle(hotel.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-surface/90 dark:bg-dark-surface/90 backdrop-blur hover:bg-surface transition"
          >
            <LuHeart className={cn('h-4 w-4', isWishlisted ? 'fill-danger text-danger' : 'text-text-2')} />
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text dark:text-dark-text line-clamp-1">{hotel.name}</h3>
          <Badge variant="outline" className="capitalize shrink-0">{hotel.type}</Badge>
        </div>
        <p className="text-sm text-text-2 dark:text-dark-text-2 flex items-center gap-1 mt-1">
          <LuMapPin className="h-3.5 w-3.5" />
          {cityName ?? 'Nepal'}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <Rating value={hotel.average_review_rating || hotel.rating} size={14} />
            <span className="text-xs text-text-3">({hotel.total_reviews})</span>
          </div>
          {lowestPrice !== null && (
            <div className="text-right">
              <span className="text-xs text-text-2">From</span>
              <p className="text-base font-bold text-primary-600 leading-none">{formatCurrency(lowestPrice)}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

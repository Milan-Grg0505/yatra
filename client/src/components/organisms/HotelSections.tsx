import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { HotelCard } from '@/components/molecules';
import { Skeleton } from '@/components/atoms';
import type { Hotel } from '@/types';

interface SectionProps {
  title: string;
  subtitle?: string;
  href?: string;
  hotels: Hotel[];
  loading?: boolean;
}

export function FeaturedHotels({ title, subtitle, href, hotels, loading }: SectionProps) {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4">
      <SectionHeader title={title} subtitle={subtitle} href={href} />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3]" />
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={1.1}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
            1280: { slidesPerView: 4 },
          }}
          navigation
          className="mt-6 !pb-4"
        >
          {hotels.map((h) => (
            <SwiperSlide key={h.id}>
              <HotelCard hotel={h} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}

export function RecommendedSection({ title, subtitle, href, hotels, loading }: SectionProps) {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4">
      <SectionHeader title={title} subtitle={subtitle} href={href} />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      )}
    </section>
  );
}

export function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-text dark:text-dark-text">{title}</h2>
        {subtitle && <p className="text-text-2 dark:text-dark-text-2 mt-1">{subtitle}</p>}
      </div>
      {href && (
        <Link to={href} className="text-sm font-medium text-primary-600 hover:underline inline-flex items-center gap-1">
          See all <LuArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

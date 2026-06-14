import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { Button, Skeleton } from '@/components/atoms';
import { heroApi } from '@/api/misc.api';
import type { Hero } from '@/types';
import hero1Image from '@/assets/images/hero1.jpg';
import hero2Image from '@/assets/images/hero2.jpg';
const FALLBACK_HEROES: Hero[] = [
  {
    id: 'h1',
    title: 'Discover the Himalayas',
    subTitle: 'Find your perfect stay',
    description: 'Book hotels, resorts, and homestays across Nepal.',
    image: hero1Image,
    order: 0,
    active: true,
  },
  {
    id: 'h2',
    title: 'Pokhara — Paradise on Earth',
    subTitle: 'Lakeside escapes',
    description: 'Lakefront hotels with breathtaking views of the Annapurnas.',
    image: hero2Image,
    order: 1,
    active: true,
  },
];

export function HeroBanner() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    heroApi
      .list()
      .then((r) => setHeroes(r.data?.length ? r.data : FALLBACK_HEROES))
      .catch(() => setHeroes(FALLBACK_HEROES))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="w-full h-[60vh] min-h-[420px]" />;

  return (
    <Swiper
      modules={[Autoplay, Pagination, EffectFade]}
      autoplay={{ delay: 5500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop
      effect="fade"
      className="w-full h-[60vh] min-h-[420px] rounded-b-3xl overflow-hidden"
    >
      {heroes.map((h) => (
        <SwiperSlide key={h.id}>
          <div className="relative w-full h-full">
            <img src={h.image} alt={h.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
              <div className="max-w-xl text-white animate-fade-in">
                <span className="inline-block text-sm font-medium text-accent-400 mb-2 tracking-wide uppercase">
                  {h.subTitle}
                </span>
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                  {h.title}
                </h1>
                <p className="mt-4 text-lg text-white/90 max-w-md">{h.description}</p>
                {h.link && (
                  <Button asChild size="lg" className="mt-6">
                    <Link to={h.link}>
                      Explore <LuArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

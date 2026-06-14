import { SearchBar } from '@/components/molecules'
import { FeaturedHotels, HeroBanner, RecommendedSection } from '@/components/organisms'
import { ROUTES } from '@/lib/constant'
import { MOCK_HOTELS } from '@/lib/mock-data'
import type { Hotel } from '@/types'
import React, { useEffect, useState } from 'react'


const HomePage = () => {
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [recommendedHotels, setRecommendedHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchHotels = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await hotelApi.getFeatured();
        // setFeaturedHotels(response.data);

        // Using mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFeaturedHotels(MOCK_HOTELS.slice(0, 6));
        setRecommendedHotels(MOCK_HOTELS);
      } catch (error) {
        console.error('Failed to fetch hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <>
      {/* Hero with floating search */}
      <section className="relative">
        <HeroBanner />
        <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
          <SearchBar />
        </div>
      </section>

      {/* Featured */}
      <FeaturedHotels
        title="Featured stays"
        subtitle="Hand-picked properties travelers love"
        href={ROUTES.HOTELS}
        hotels={featuredHotels}
        loading={loading && featuredHotels.length === 0}
      />

      {/* Recommended */}
      <RecommendedSection
        title="Recommended for you"
        subtitle="Based on your interests"
        href={ROUTES.HOTELS}
        hotels={recommendedHotels}
        loading={loading && recommendedHotels.length === 0}
      />
    </>
  )
}

export default HomePage
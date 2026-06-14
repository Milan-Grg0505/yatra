// lib/mock-data.ts
import type { Hotel, Booking } from '@/types';



// Use paths from public folder (no imports needed!)
const PLACEHOLDER_IMAGES = [
  '/images/hotels/hotel1.webp',
  '/images/hotels/hotel2.jpg',
  '/images/hotels/hotel3.jpg',
  '/images/hotels/hotel4.jpg',
  '/images/hotels/hotel5.jpg',
  '/images/hotels/hotel6.jpg',
  '/images/hotels/hotel7.jpg',
  '/images/hotels/hotel8.jpg',
];

export const MOCK_HOTELS: Hotel[] = Array.from({ length: 8 }, (_, i) => ({
  id: `${i + 1}`,
  name: ['Hotel Yak & Yeti', 'Temple Tree Resort', 'Club Himalaya', 'Baber Mahal Vilas',
    'Fish Tail Lodge', 'The Dwarika\'s', 'Shangri-La Hotel', 'Waterfront Resort'][i],
  description: 'Beautiful hotel with amazing amenities',
  price: [120, 95, 150, 180, 200, 250, 110, 135][i],
  rating: [4.8, 4.6, 4.9, 4.7, 4.8, 4.9, 4.5, 4.6][i],
  reviewCount: [342, 278, 156, 89, 312, 234, 467, 198][i],
  image: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
  city: { id: `${Math.floor(i / 4) + 1}`, name: i < 4 ? 'Kathmandu' : 'Pokhara' },
  location: i < 4 ? 'Kathmandu' : 'Pokhara',
  amenities: ['WiFi', 'Parking'],
}) as any);


export interface OwnerHotel extends Hotel {
  status: 'approved' | 'pending' | 'rejected';
  average_review_rating: number;
  total_reviews: number;
  booking_count: number;
  revenue: number;
}

export interface OwnerBooking extends Booking {
  hotel_id: {
    id: string;
    name: string;
    image: string;
  };
  guest_name: string;
  guest_email: string;
  payment_status: 'paid' | 'pending' | 'failed';
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'confirmed' | 'pending' | 'canceled' | 'completed';
}

// Mock Hotels for Owner
export const MOCK_MY_HOTELS: OwnerHotel[] = [
  {
    id: '1',
    name: 'Hotel Yak & Yeti',
    description: 'Luxury hotel in the heart of Kathmandu',
    price: 120,
    rating: 4.8,
    reviewCount: 342,
    image: '/images/hotels/hotel1.webp',
    city: { id: '1', name: 'Kathmandu' },
    location: 'Kathmandu',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
    status: 'approved',
    average_review_rating: 4.8,
    total_reviews: 342,
    booking_count: 156,
    revenue: 18720,
  },
  {
    id: '2',
    name: 'Temple Tree Resort',
    description: 'Beautiful resort with mountain views',
    price: 95,
    rating: 4.6,
    reviewCount: 278,
    image: '/images/hotels/hotel1.webp',
    city: { id: '2', name: 'Pokhara' },
    location: 'Pokhara',
    amenities: ['WiFi', 'Restaurant', 'Parking', 'Lake View'],
    status: 'approved',
    average_review_rating: 4.6,
    total_reviews: 278,
    booking_count: 98,
    revenue: 9310,
  },
  {
    id: '3',
    name: 'Club Himalaya Resort',
    description: 'Stunning views of the Himalayan range',
    price: 150,
    rating: 4.9,
    reviewCount: 156,
    image: '/images/hotels/hotel1.webp',
    city: { id: '3', name: 'Nagarkot' },
    location: 'Nagarkot',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Mountain View'],
    status: 'approved',
    average_review_rating: 4.9,
    total_reviews: 156,
    booking_count: 234,
    revenue: 35100,
  },
  {
    id: '4',
    name: 'Baber Mahal Vilas',
    description: 'Heritage hotel with royal experience',
    price: 180,
    rating: 4.7,
    reviewCount: 89,
    image: '/images/hotels/hotel1.webp',
    city: { id: '1', name: 'Kathmandu' },
    location: 'Kathmandu',
    amenities: ['WiFi', 'Spa', 'Restaurant', 'Gym', 'Heritage Tours'],
    status: 'pending',
    average_review_rating: 0,
    total_reviews: 0,
    booking_count: 0,
    revenue: 0,
  },
] as any;

// Mock Bookings for Owner
export const MOCK_BOOKINGS: OwnerBooking[] = [
  {
    id: 'b1',
    hotel_id: {
      id: '1',
      name: 'Hotel Yak & Yeti',
      image: '/images/hotels/hotel1.webp',
    },
    guest_name: 'John Doe',
    guest_email: 'john@example.com',
    check_in: '2024-06-15',
    check_out: '2024-06-18',
    total_price: 360,
    status: 'confirmed',
    payment_status: 'paid',
    num_guests: 2,
    room_type: 'Deluxe Room',
  },
  {
    id: 'b2',
    hotel_id: {
      id: '1',
      name: 'Hotel Yak & Yeti',
      image: '/images/hotels/hotel1.webp',
    },
    guest_name: 'Jane Smith',
    guest_email: 'jane@example.com',
    check_in: '2024-06-20',
    check_out: '2024-06-22',
    total_price: 240,
    status: 'confirmed',
    payment_status: 'paid',
    num_guests: 2,
    room_type: 'Standard Room',
  },
  {
    id: 'b3',
    hotel_id: {
      id: '1',
      name: 'Hotel Yak & Yeti',
      image: '/images/hotels/hotel1.webp',
    },
    guest_name: 'Mike Johnson',
    guest_email: 'mike@example.com',
    check_in: '2024-06-25',
    check_out: '2024-06-28',
    total_price: 360,
    status: 'pending',
    payment_status: 'pending',
    num_guests: 2,
    room_type: 'Deluxe Room',
  },
  {
    id: 'b4',
    hotel_id: {
      id: '2',
      name: 'Temple Tree Resort',
      image: '/images/hotels/hotel1.webp',
    },
    guest_name: 'Sarah Williams',
    guest_email: 'sarah@example.com',
    check_in: '2024-06-10',
    check_out: '2024-06-15',
    total_price: 475,
    status: 'completed',
    payment_status: 'paid',
    num_guests: 4,
    room_type: 'Family Suite',
  },
  {
    id: 'b5',
    hotel_id: {
      id: '2',
      name: 'Temple Tree Resort',
      image: '/images/hotels/hotel1.webp',
    },
    guest_name: 'David Brown',
    guest_email: 'david@example.com',
    check_in: '2024-07-01',
    check_out: '2024-07-05',
    total_price: 380,
    status: 'confirmed',
    payment_status: 'paid',
    num_guests: 2,
    room_type: 'Deluxe Room',
  },
  {
    id: 'b6',
    hotel_id: {
      id: '3',
      name: 'Club Himalaya Resort',
      image: '/images/hotels/hotel1.webp',
    },
    guest_name: 'Emily Chen',
    guest_email: 'emily@example.com',
    check_in: '2024-06-18',
    check_out: '2024-06-22',
    total_price: 600,
    status: 'confirmed',
    payment_status: 'paid',
    num_guests: 2,
    room_type: 'Suite',
  },
  {
    id: 'b7',
    hotel_id: {
      id: '3',
      name: 'Club Himalaya Resort',
      image: '/images/hotels/hotel1.webp',
    },
    guest_name: 'Robert Taylor',
    guest_email: 'robert@example.com',
    check_in: '2024-06-28',
    check_out: '2024-07-02',
    total_price: 750,
    status: 'pending',
    payment_status: 'pending',
    num_guests: 3,
    room_type: 'Executive Suite',
  },
  {
    id: 'b8',
    hotel_id: {
      id: '1',
      name: 'Hotel Yak & Yeti',
      image: '/images/hotels/hotel1.webp',
    },
    guest_name: 'Lisa Anderson',
    guest_email: 'lisa@example.com',
    check_in: '2024-07-05',
    check_out: '2024-07-08',
    total_price: 360,
    status: 'canceled',
    payment_status: 'failed',
    num_guests: 2,
    room_type: 'Deluxe Room',
  },
] as any;

// Performance metrics
export const OWNER_METRICS = {
  totalRevenue: 63130, // 18720 + 9310 + 35100
  totalBookings: 156 + 98 + 234,
  occupancyRate: 78,
  averageRating: 4.7,
  pendingApprovals: 1,
  completionRate: 85,
};

// Recent activities
export const RECENT_ACTIVITIES = [
  {
    id: 'act1',
    type: 'booking',
    message: 'New booking received for Hotel Yak & Yeti',
    timestamp: '2024-06-15T10:30:00Z',
    status: 'success',
  },
  {
    id: 'act2',
    type: 'review',
    message: 'New 5-star review for Temple Tree Resort',
    timestamp: '2024-06-14T15:45:00Z',
    status: 'success',
  },
  {
    id: 'act3',
    type: 'alert',
    message: 'Check-in reminder: Guest arriving at Club Himalaya Resort today',
    timestamp: '2024-06-14T09:00:00Z',
    status: 'info',
  },
  {
    id: 'act4',
    type: 'booking',
    message: 'Booking canceled for Hotel Yak & Yeti',
    timestamp: '2024-06-13T18:20:00Z',
    status: 'warning',
  },
  {
    id: 'act5',
    type: 'alert',
    message: 'Pending approval: Baber Mahal Vilas needs review',
    timestamp: '2024-06-12T11:00:00Z',
    status: 'pending',
  },
];

// Monthly revenue data for charts
export const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 5200, bookings: 32 },
  { month: 'Feb', revenue: 6100, bookings: 38 },
  { month: 'Mar', revenue: 7800, bookings: 45 },
  { month: 'Apr', revenue: 8500, bookings: 52 },
  { month: 'May', revenue: 9200, bookings: 58 },
  { month: 'Jun', revenue: 10400, bookings: 64 },
];

// Helper functions
export const getHotelById = (id: string) => MOCK_MY_HOTELS.find(h => h.id === id);
export const getBookingsByHotelId = (hotelId: string) =>
  MOCK_BOOKINGS.filter(b => b.hotel_id.id === hotelId);
export const getTotalRevenue = () => MOCK_MY_HOTELS.reduce((sum, h) => sum + h.revenue, 0);
export const getTotalBookings = () => MOCK_MY_HOTELS.reduce((sum, h) => sum + h.booking_count, 0);
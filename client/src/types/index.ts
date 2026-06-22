/* =====================================================================
   TYPE DEFINITIONS — matches Yatra backend models 1:1
   ===================================================================== */

/* ---------- Shared shapes ---------- */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages?: number;
  totalPages?: number;
  unread?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/* ---------- Enums ---------- */
export type Role = 'admin' | 'user' | 'owner';
export type HotelType = 'resort' | 'hostel' | 'hotel' | 'homestay' | 'other';
export type HotelStatus = 'approved' | 'pending' | 'rejected';
export type BookingStatus = 'confirmed' | 'pending' | 'canceled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'esewa' | 'khalti' | 'cash';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type CancellationPolicy = 'free' | 'flexible' | 'moderate' | 'strict';
export type ViewType = 'city' | 'mountain' | 'garden' | 'pool' | 'ocean' | 'none';
export type TravelStyle = 'luxury' | 'budget' | 'adventure' | 'family' | 'business' | 'solo';
export type DifficultyLevel = 'easy' | 'moderate' | 'challenging';
export type OtpType = 'verification' | 'password_reset' | 'email_change';

/* ---------- User ---------- */
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  notifications: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  address?: string;
  hotel?: string | null;
  role: Role;
  google_id?: string;
  is_email_verified: boolean;
  is_approved?: boolean | null;
  preferences: UserPreferences;
  travel_style: TravelStyle[];
  favorite_hotels: string[];
  wishlist: string[];
  last_login?: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------- City ---------- */
export interface City {
  id: string;
  name: string;
  image?: string;
  country?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

/* ---------- Facility / Service ---------- */
export interface Facility {
  id: string;
  name: string;
  icon?: string;
  active: boolean;
}
export interface Service {
  id: string;
  name: string;
  icon?: string;
  active: boolean;
}

/* ---------- Photo ---------- */
export interface Photo {
  id: string;
  url: string;
  public_id?: string;
  hotel_id: string;
  caption?: string;
}

/* ---------- Policy ---------- */
export interface Policy {
  id: string;
  hotel_id: string;
  title: string;
  description?: string;
}

/* ---------- Room ---------- */
export interface Room {
  id: string;
  hotel_id: string;
  room_type: 'single' | 'double' | 'suite' | 'deluxe' | 'family' | 'other';
  room_name: string;
  number_of_rooms: number;
  bed_type: 'single' | 'double' | 'queen' | 'king' | 'bunk' | 'sofa' | 'other';
  number_of_beds: number;
  smoking_policy: 'smoking' | 'non-smoking' | 'both';
  base_price: number;
  max_guest: number;
  room_size?: string;
  services: Service[] | string[];
  discount_percentage: number;
  weekend_price?: number;
  festival_price?: number;
  images: string[];
  amenities: string[];
  view_type: ViewType;
  floor_number?: number;
  has_ac: boolean;
  has_wifi: boolean;
  has_tv: boolean;
  has_minibar: boolean;
  has_safe: boolean;
  available_count?: number;
  createdAt: string;
  updatedAt: string;
}

/* ---------- Hotel ---------- */
export interface Hotel {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pan_number?: string;
  registration_number?: string;
  logo?: string;
  description?: string;
  type: HotelType;
  status: HotelStatus;
  city_id?: City | string;
  facilities: Facility[] | string[];
  owner_id?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  street?: string;
  zip_code?: string;
  check_in_time: string;
  check_out_time: string;
  cancellation_policy: CancellationPolicy;
  cancellation_deadline_hours: number;
  cancellation_fee_percentage: number;
  tax_percentage: number;
  service_charge_percentage: number;
  min_advance_booking_days: number;
  max_advance_booking_days: number;
  min_stay_nights: number;
  rating: number;
  rating_count: number;
  average_review_rating: number;
  total_reviews: number;
  view_count: number;
  booking_count: number;
  popularity_score: number;
  rooms?: Room[];
  photos?: Photo[];
  policies?: Policy[];
  createdAt: string;
  updatedAt: string;
}

/* ---------- Booking ---------- */
export interface GuestDetail {
  full_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

export interface Booking {
  id: string;
  user_id: string | Pick<User, 'id' | 'name' | 'email'>;
  hotel_id: string | Pick<Hotel, 'id' | 'name' | 'logo' | 'address'>;
  room?: string | Room | null;
  check_in: string;
  check_out: string;
  num: number;
  guest_count: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_id?: string;
  base_price: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total_price: number;
  coupon_code?: string;
  special_requests?: string;
  guest_details: GuestDetail[];
  cancelled_at?: string;
  cancellation_reason?: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------- Review ---------- */
export interface Review {
  id: string;
  user_id: string | Pick<User, 'id' | 'name' | 'image'>;
  hotel_id: string | Pick<Hotel, 'id' | 'name' | 'logo'>;
  booking_id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  helpful_count: number;
  helpful_by: string[];
  reported?: boolean;
  owner_response?: string;
  owner_response_date?: string;
  status: ReviewStatus;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentiment_score?: number;
  topics: string[];
  createdAt: string;
  updatedAt: string;
}

/* ---------- Travel package ---------- */
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: Array<'breakfast' | 'lunch' | 'dinner'>;
}

export interface TravelPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration_days: number;
  duration_nights: number;
  price_per_person: number;
  discount_price?: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  hotel_ids: string[] | Hotel[];
  city_ids: string[] | City[];
  start_city_id: string | City;
  end_city_id: string | City;
  group_size_min: number;
  group_size_max: number;
  difficulty_level: DifficultyLevel;
  season_start?: string;
  season_end?: string;
  featured_image?: string;
  gallery_images: string[];
  status: 'active' | 'inactive' | 'upcoming';
  total_bookings: number;
  average_rating: number;
  view_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface TravelerDetail {
  full_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  id_proof?: string;
}

export interface TravelBooking {
  id: string;
  user_id: string;
  package_id: string | TravelPackage;
  travel_date: string;
  number_of_travelers: number;
  total_price: number;
  traveler_details: TravelerDetail[];
  special_requirements?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_id?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------- AI / Chat ---------- */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
}

export interface ChatSession {
  _id: string;
  last: { message: string; response: string; createdAt: string };
  turns: number;
}

/* ---------- Notification ---------- */
export type NotificationType =
  | 'booking_confirmed'
  | 'booking_canceled'
  | 'review_response'
  | 'review_approved'
  | 'payment_success'
  | 'payment_failed'
  | 'hotel_approved'
  | 'hotel_rejected'
  | 'hotel_registered'
  | 'travel_booking'
  | 'system';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  read_at?: string;
  createdAt: string;
}

/* ---------- Hero / Blog / Coupon ---------- */
export interface Hero {
  id: string;
  image: string;
  title: string;
  subTitle: string;
  description: string;
  link?: string;
  order: number;
  active: boolean;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  content?: string;
  tags: string[];
  author_id?: { id: string; name: string; image?: string } | string;
  view_count: number;
  published: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_amount: number;
  max_discount_amount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  used_count: number;
  applicable_hotels: string[];
  active: boolean;
}

/* ---------- Activity ---------- */
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  action_type: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

/* ---------- Pricing breakdown returned by /hotels/price-predict ---------- */
export interface PriceBreakdown {
  price_per_night: number;
  nights: number;
  total: number;
  breakdown: {
    base: number;
    seasonality: number;
    occupancy: number;
    demand: number;
    advance: number;
    loyalty: number;
  };
}

/* ---------- Availability response ---------- */
export interface AvailabilityResponse {
  available: boolean;
  total: number;
  used: number;
}

/* ---------- Map/Geocode ---------- */
export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

export interface NearbyPlace {
  name: string;
  type: string;
  lat: number;
  lng: number;
  distance_km: number;
  rating?: number;
}

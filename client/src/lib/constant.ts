/* ---------- Routes ---------- */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  OAUTH_CALLBACK: '/oauth/success',
  HOTELS: '/search',
  BLOGS: '/blogs',
  BLOG_DETAIL: (id = ':id') => `/blogs/${id}`,
  HOTEL_DETAIL: (id = ':id') => `/hotels/${id}`,
  WISHLIST: '/wishlist',
  MY_BOOKINGS: '/my-bookings',
  BOOKING_CHECKOUT: '/booking-checkout',
  MY_REVIEWS: '/my-reviews',
  PROFILE: '/profile',
  TRAVEL_PACKAGES: '/travel-packages',
  TRAVEL_PACKAGE_DETAIL: (id = ':id') => `/travel-packages/${id}`,
  CHAT: '/chat',
  VERIFY_OTP: '/auth/verify-otp',
  RESET_PASSWORD: '/auth/reset-password',

  OWNER: {
    DASHBOARD: '/owner/dashboard',
    HOTELS: '/owner/hotels',
    HOTEL_ROOMS: (id = ':id') => `/owner/hotels/${id}/rooms`,
    BOOKINGS: '/owner/bookings',
    REVIEWS: '/owner/reviews',
    ANALYTICS: '/owner/analytics',
    REGISTER_PROPERTY: '/owner/register-property',
  },

  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    HOTELS: '/admin/hotels',
    APPROVE_HOTELS: '/admin/hotels/approve',
    BOOKINGS: '/admin/bookings',
    REVIEWS: '/admin/reviews',
    TRAVEL_PACKAGES: '/admin/travel-packages',
    CITIES: '/admin/cities',
    BLOGS: '/admin/blogs',
    COUPONS: '/admin/coupons',
    SETTINGS: '/admin/settings',
  },
} as const;

/* ---------- API ---------- */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';
export const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:8000';
export const ESEWA_FORM_URL =
  import.meta.env.VITE_ESEWA_FORM_URL ?? 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

/* ---------- Select options ---------- */
export const HOTEL_TYPES = ['hotel', 'resort', 'hostel', 'homestay', 'other'] as const;

export const ROOM_TYPES = ['single', 'double', 'suite', 'deluxe', 'family', 'other'] as const;

export const BED_TYPES = ['single', 'double', 'queen', 'king', 'bunk', 'sofa', 'other'] as const;

export const VIEW_TYPES = ['none', 'city', 'mountain', 'garden', 'pool', 'ocean'] as const;

export const TRAVEL_STYLES = ['luxury', 'budget', 'adventure', 'family', 'business', 'solo'] as const;

export const DIFFICULTY_LEVELS = ['easy', 'moderate', 'challenging'] as const;

export const CANCELLATION_POLICIES = ['free', 'flexible', 'moderate', 'strict'] as const;

export const PAYMENT_METHODS = [
  { value: 'esewa', label: 'eSewa', logo: 'https://esewa.com.np/common/images/esewa_logo.png' },
  { value: 'khalti', label: 'Khalti', logo: 'https://web.khalti.com/static/img/khalti.svg' },
  { value: 'cash', label: 'Cash on Arrival', logo: '' },
] as const;

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ne', label: 'नेपाली' },
];

export const CURRENCIES = ['NPR', 'USD', 'EUR', 'INR', 'GBP', 'AUD'];

/* ---------- Suggested AI prompts ---------- */
export const AI_SUGGESTIONS = [
  'Find hotels in Pokhara under NPR 5,000',
  'Best treks in Nepal for beginners',
  'Family-friendly homestays near Kathmandu',
  'What is the cancellation policy?',
  'Plan a 7-day trip to Annapurna',
];

/* ---------- Default fallback image ---------- */
export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e2e8f0"/><text x="50%25" y="50%25" font-family="sans-serif" font-size="20" fill="%2394a3b8" text-anchor="middle" dy=".3em">No image</text></svg>';

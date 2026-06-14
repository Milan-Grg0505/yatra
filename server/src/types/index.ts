export type Role = 'admin' | 'user' | 'owner';

export type HotelStatus = 'approved' | 'pending' | 'rejected';
export type HotelType = 'resort' | 'hostel' | 'hotel' | 'homestay' | 'other';

export type BookingStatus = 'confirmed' | 'pending' | 'canceled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'esewa' | 'khalti' | 'cash';

export type OtpType = 'verification' | 'password_reset' | 'email_change';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';


export type ViewType = 'city' | 'mountain' | 'garden' | 'pool' | 'ocean' | 'none';

export type TravelStyle = 'luxury' | 'budget' | 'adventure' | 'family' | 'business' | 'solo';
export type CancellationPolicy = 'free' | 'flexible' | 'moderate' | 'strict';
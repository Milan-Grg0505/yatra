import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute, GuestOnlyRoute } from './guards';
import { ROUTES } from '@/lib/constant';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { OAuthCallback } from '@/pages/auth/OAuthCallback';

// User pages
import HomePage from '@/pages/user/HomePage';
import { AboutPage } from '@/pages/user/AboutPage';
import { BlogsPage } from '@/pages/user/BlogsPage';
import { BlogDetailPage } from '@/pages/user/BlogDetailPage';
import { SearchResultsPage } from '@/pages/user/SearchResultsPage';
import { HotelDetailPage } from '@/pages/user/HotelDetailPage';
// import { MyBookingsPage } from '@/pages/user/MyBookingsPage';
// import { MyReviewsPage } from '@/pages/user/MyReviewsPage';
// import { WishlistPage } from '@/pages/user/WishlistPage';
import { ProfilePage } from '@/pages/user/ProfilePage';
import { TravelPackagesPage } from '@/pages/user/TravelPackagesPage';
import { PackageDetailPage } from '@/pages/user/PackageDetailPage';
// import { ChatPage } from '@/pages/user/ChatPage';

// Owner pages
import { OwnerDashboard } from '@/pages/owner/OwnerDashboard';
import { RegisterPropertyPage } from '@/pages/owner/RegisterPropertyPage';
import { OwnerHotelsPage } from '@/pages/owner/OwnerHotelsPage';
import { ManageRoomsPage } from '@/pages/owner/ManageRoomsPage';
// import { OwnerBookingsPage } from '@/pages/owner/OwnerBookingsPage';
// import { OwnerReviewsPage } from '@/pages/owner/OwnerReviewsPage';
// import { OwnerAnalyticsPage } from '@/pages/owner/OwnerAnalyticsPage';

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminHotelsPage, ApproveHotelsPage } from '@/pages/admin/AdminHotelPage';
import { AdminHeroPage } from '@/pages/admin/AdminHeroPage';
// import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { AdminTravelPackagesPage } from '@/pages/admin/AdminTravelPackagesPage';
import {
  AdminCitiesPage,
  AdminBlogsPage,
  AdminCouponsPage,
  AdminSettingsPage,
} from '@/pages/admin/AdminMiscPages';

// Shared
import { NotFoundPage } from '@/pages/ErrorPage';


export function AppRouter() {
  return (
    <Routes>
      {/* OAuth callback - standalone, no layout */}
      <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />

      {/* Auth - guest only */}
      <Route element={<GuestOnlyRoute><AuthLayout /></GuestOnlyRoute>}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtpPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>

      {/* Main app */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        <Route path={ROUTES.HOTELS} element={<SearchResultsPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />
        <Route path={ROUTES.TRAVEL_PACKAGES} element={<TravelPackagesPage />} />
        <Route path="/travel-packages/:id" element={<PackageDetailPage />} />
        <Route path={ROUTES.BLOGS} element={<BlogsPage />} />
        <Route path="/blogs/:id" element={<BlogDetailPage />} />
        {/* <Route path={ROUTES.BOOKING_CHECKOUT} element={<BookingCheckoutPage />} />
        <Route path="/payment/:provider/return" element={<PaymentReturnPage />} /> */}

        {/* Authenticated user routes */}
        {/* <Route path={ROUTES.WISHLIST} element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path={ROUTES.MY_BOOKINGS} element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path={ROUTES.MY_REVIEWS} element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} /> */}
        <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        {/* <Route path={ROUTES.CHAT} element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        } */}
      </Route>

      {/* Owner dashboard */}
      <Route
        element={
          <ProtectedRoute allow={['owner', 'admin']}>
            <DashboardLayout variant="owner" />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.OWNER.DASHBOARD} element={<OwnerDashboard />} />
        <Route path={ROUTES.OWNER.REGISTER_PROPERTY} element={<RegisterPropertyPage />} />
        <Route path={ROUTES.OWNER.HOTELS} element={<OwnerHotelsPage />} />
        <Route path="/owner/hotels/:id/rooms" element={<ManageRoomsPage />} />
        {/* 
        <Route path={ROUTES.OWNER.BOOKINGS} element={<OwnerBookingsPage />} />
        <Route path={ROUTES.OWNER.REVIEWS} element={<OwnerReviewsPage />} />
        <Route path={ROUTES.OWNER.ANALYTICS} element={<OwnerAnalyticsPage />} /> */}
      </Route> *

      {/* Admin dashboard */}
      <Route
        element={
          <ProtectedRoute allow={['admin']}>
            <DashboardLayout variant="admin" />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN.USERS} element={<AdminUsersPage />} />
        <Route path={ROUTES.ADMIN.HOTELS} element={<AdminHotelsPage />} />
        <Route path={ROUTES.ADMIN.APPROVE_HOTELS} element={<ApproveHotelsPage />} />
        <Route path={ROUTES.ADMIN.HEROES} element={<AdminHeroPage />} />
        {/* 
        <Route path={ROUTES.ADMIN.BOOKINGS} element={<AdminBookingsPage />} />
        */}
        <Route path={ROUTES.ADMIN.REVIEWS} element={<AdminReviewsPage />} />
        <Route path={ROUTES.ADMIN.TRAVEL_PACKAGES} element={<AdminTravelPackagesPage />} />
        <Route path={ROUTES.ADMIN.CITIES} element={<AdminCitiesPage />} />
        <Route path={ROUTES.ADMIN.BLOGS} element={<AdminBlogsPage />} />
        <Route path={ROUTES.ADMIN.COUPONS} element={<AdminCouponsPage />} />
        <Route path={ROUTES.ADMIN.SETTINGS} element={<AdminSettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

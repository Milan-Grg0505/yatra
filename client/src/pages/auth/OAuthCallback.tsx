// pages/auth/OAuthCallback.tsx
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Spinner, Logo } from '@/components/atoms';
import { useAppDispatch } from '@/hooks';
import { setCredentials } from '@/features/slices/authSlice';
import { ROUTES } from '@/lib/constant';
import { jwtDecode } from 'jwt-decode';

// Install: pnpm add jwt-decode

interface JWTPayload {
  sub: string;
  name?: string;
  email?: string;
  role?: string;
  is_approved?: boolean | null;
  exp?: number;
}

export function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('token');
    const refresh = params.get('refresh') ?? params.get('refresh_token');
    const error = params.get('error');

    console.log('OAuth Callback - Token present:', !!token);
    console.log('OAuth Callback - Error:', error);

    if (error) {
      toast.error(`Google sign-in failed: ${error}`);
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    if (!token) {
      toast.error('Missing authentication token');
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    // Store tokens
    localStorage.setItem('token', token);
    if (refresh) {
      localStorage.setItem('refreshToken', refresh);
    }

    // Decode JWT to get user info (no API call needed!)
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      console.log('Decoded token:', decoded);

      // Create user object from decoded token
      const user = {
        id: decoded.sub,
        name: decoded.name || 'User',
        email: decoded.email || '',
        role: (decoded.role || 'user') as 'user' | 'owner' | 'admin',
        is_approved: decoded.is_approved ?? null,
        phone: undefined,
        address: undefined,
        image: undefined,
        is_email_verified: true,
        preferences: {
          theme: 'light' as const,
          language: 'en',
          currency: 'NPR',
          notifications: true,
        },
        travel_style: [],
        favorite_hotels: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Dispatch to Redux
      dispatch(setCredentials({
        user,
        token,
        refresh_token: refresh || '',
      }));

      toast.success(`Welcome, ${user.name}!`);

      // Role-based redirect
      if (user.role === 'admin') {
        navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
      } else if (user.role === 'owner') {
        navigate(ROUTES.OWNER.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.HOME, { replace: true });
      }
    } catch (err) {
      console.error('Failed to decode token:', err);
      toast.error('Failed to complete sign in');
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [params, dispatch, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary-50 to-surface dark:from-dark-surface dark:to-dark-surface-2">
      <div className="text-center">
        <Logo size="lg" />
        <Spinner size="lg" className="mt-6" />
        <p className="text-sm text-text-2 mt-4">Signing you in…</p>
      </div>
    </div>
  );
}
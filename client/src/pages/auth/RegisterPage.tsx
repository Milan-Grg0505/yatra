import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuMail, LuLock, LuUser, LuPhone, LuHouse, LuBriefcase, LuCheck } from 'react-icons/lu';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';
import { Button, Input } from '@/components/atoms';
import { registerSchema, type RegisterInput } from '@/lib/validation/auth.validation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAuth, clearAuthError } from '@/features/slices/authSlice';
import { registerThunk } from '@/features/thunks/authThunks';
import { ROUTES, SERVER_URL } from '@/lib/constant';
import { cn } from '@/lib/utils';

type Role = 'user' | 'owner';

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useAppSelector(selectAuth);
  // Initial role from URL: ?role=owner → property owner tab open by default
  // Get role from location state (clean URL)
  const initialRole: Role = (location.state as { role?: Role })?.role === 'owner' ? 'owner' : 'user';
  const [role, setRole] = useState<Role>(initialRole ?? 'user');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
      role: initialRole,
    },
  });

  // Watch role changes from the form
  const watchedRole = watch('role');

  // Update form value when role state changes
  useEffect(() => {
    setValue('role', role);
  }, [role, setValue]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (data: RegisterInput) => {
    dispatch(clearAuthError());
    // Force role from active tab (overrides hidden field tampering)
    try {
      // ✅ unwrap() to get the payload or throw error
      const result = await dispatch(registerThunk(data)).unwrap();

      toast.success(
        role === 'owner'
          ? 'Account created! Sign in to set up your property.'
          : 'Account created! Please sign in.'
      );

      // Navigate to login
      navigate(ROUTES.VERIFY_OTP, { state: { email: data.email, type: 'verification' } });

    } catch (err) {
      // Error is already in state from thunk
      toast.error(err as string || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="bg-surface dark:bg-dark-surface rounded-3xl shadow-elevated border border-border dark:border-dark-border p-8 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl font-bold">Create your account</h1>
        <p className="text-sm text-text-2 mt-1">Start exploring Nepal with Yatra</p>
      </div>

      {/* Role tabs — owner CAN register from here, but cannot pick role at LOGIN */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-2 dark:bg-dark-surface-2 mb-6">
        <RoleTab
          active={role === 'user'}
          onClick={() => setRole('user')}
          icon={<LuHouse className="h-4 w-4" />}
          label="Traveler"
          desc="Book hotels & trips"
        />
        <RoleTab
          active={role === 'owner'}
          onClick={() => setRole('owner')}
          icon={<LuBriefcase className="h-4 w-4" />}
          label="Property Owner"
          desc="List your hotel"
        />
      </div>


      {role === 'owner' && (
        <div className="mb-5 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-sm text-primary-700 dark:text-primary-300">
          <p className="font-medium flex items-center gap-1.5">
            <LuCheck className="h-4 w-4" /> You're registering as a Property Owner
          </p>
          <p className="text-xs mt-1 text-primary-700/80 dark:text-primary-300/80">
            After signing in, you'll be redirected to your Owner Dashboard where you can add hotels (pending admin approval).
          </p>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-danger/10 text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ✅ Hidden input for role to ensure it's submitted */}
        <input type="hidden" {...register('role')} />

        <Input
          label={role === 'owner' ? 'Owner / Business Name' : 'Full name'}
          icon={<LuUser className="h-4 w-4" />}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          icon={<LuMail className="h-4 w-4" />}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone (optional)"
          icon={<LuPhone className="h-4 w-4" />}
          autoComplete="tel"
          placeholder="98XXXXXXXX"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Password"
          type="password"
          icon={<LuLock className="h-4 w-4" />}
          autoComplete="new-password"
          hint="Minimum 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          icon={<LuLock className="h-4 w-4" />}
          autoComplete="new-password"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        <Button type="submit" fullWidth size="lg" loading={loading}>
          {role === 'owner' ? 'Create Owner Account' : 'Create Account'}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border dark:bg-dark-border" />
        <span className="text-xs text-text-3">OR</span>
        <div className="flex-1 h-px bg-border dark:bg-dark-border" />
      </div>


      <Button variant="outline" fullWidth size="lg" asChild>
        <a href={`${SERVER_URL}/api/auth/google`}>
          <FcGoogle className="h-5 w-5" />
          Continue with Google
        </a>
      </Button>

      <p className="text-center text-sm text-text-2 mt-6">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function RoleTab({
  active,
  onClick,
  icon,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1 px-4 py-3 rounded-lg text-left transition-all',
        active
          ? 'bg-surface dark:bg-dark-surface shadow-sm ring-1 ring-primary-200 dark:ring-primary-800'
          : 'hover:bg-surface dark:hover:bg-dark-surface/50',
      )}
    >
      <div className={cn('flex items-center gap-2 text-sm font-semibold', active ? 'text-primary-600' : 'text-text-2')}>
        {icon}
        {label}
      </div>
      <p className="text-xs text-text-3">{desc}</p>
    </button>
  );
}
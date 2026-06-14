import { useAppDispatch, useAppSelector } from "@/hooks";
import { useEffect, useState } from "react";
import { LuEye, LuEyeOff, LuLock, LuMail } from "react-icons/lu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validation/auth.validation";

import { clearAuthError, selectAuth, selectIsAuthenticated } from "@/features/slices/authSlice";
import { Button, Input } from "@/components/atoms";
import { FcGoogle } from 'react-icons/fc';
import { API_BASE, ROUTES, SERVER_URL } from "@/lib/constant";
import { loginThunk } from "@/features/thunks/authThunks";
import { toast } from "sonner";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useAppSelector(selectAuth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });


  // Clear error when component unmounts or user starts typing
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // onSubmit Handler
  const onSubmit = async (data: LoginInput) => {
    dispatch(clearAuthError());
    const result = await dispatch(loginThunk(data));

    if (loginThunk.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}!`);
      const role = result.payload.user.role;
      const from = (location.state as { from?: string } | null)?.from;
      // Smart redirect by role (no role dropdown — backend decides)
      if (from) navigate(from, { replace: true });
      else if (role === 'admin') navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
      else if (role === 'owner') navigate(ROUTES.OWNER.DASHBOARD, { replace: true });
      else navigate(ROUTES.HOME, { replace: true });
    }
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `${SERVER_URL}/api/v1/auth/google`;
    console.log('Redirecting to:', googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="bg-surface dark:bg-dark-surface rounded-3xl shadow-elevated border border-border dark:border-dark-border p-8 animate-fade-in">
      <div className="text-center mb-7">
        <h1 className="font-display text-3xl font-bold text-text dark:text-dark-text">
          Welcome back
        </h1>
        <p className="text-sm text-text-2 mt-1">Sign in to continue your journey</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-danger/10 text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Address */}
        <Input
          label="Email"
          icon={<LuMail className="h-4 w-4" />}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password */}
        <Input
          label="Password"
          icon={<LuLock className="h-4 w-4" />}
          type={showPw ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          rightSlot={
            <button type="button" onClick={() => setShowPw((s) => !s)} className="cursor-pointer">
              {showPw ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
            </button>
          }
          {...register("password")}
        />
        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        {/* Button */}
        <Button type="submit" loading={loading} fullWidth size="lg">
          Sign in
        </Button>

      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border dark:bg-dark-border" />
        <span className="text-xs text-text-3">OR</span>
        <div className="flex-1 h-px bg-border dark:bg-dark-border" />
      </div>

      {/* Google Login Buttton */}
      <Button
        variant="outline"
        fullWidth
        size="lg"
        onClick={handleGoogleLogin}
      >
        <FcGoogle className="h-5 w-5" />
        Continue with Google
      </Button>


      {/* Sign up page link */}
      <p className="text-center text-sm text-text-2 mt-6">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>


    </div>
  );
}
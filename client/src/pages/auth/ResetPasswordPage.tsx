import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LuLock } from 'react-icons/lu';
import { Button, Input } from '@/components/atoms';
import { authApi } from '@/api/auth.api';
import { ROUTES } from '@/lib/constant';

const schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type FormInput = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; otp?: string } | null;
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>({ resolver: zodResolver(schema) });

  useEffect(() => {
    // Without an email+OTP this page has nothing to act on — bounce back
    if (!state?.email || !state?.otp) navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
  }, [state, navigate]);

  const onSubmit = async ({ password }: FormInput) => {
    if (!state?.email || !state?.otp) return;
    setSubmitting(true);
    try {
      await authApi.resetPassword({ email: state.email, otp: state.otp, new_password: password });
      toast.success('Password updated — please log in');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-8 shadow-card">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 mb-4">
            <LuLock className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold">Set a new password</h1>
          <p className="text-sm text-text-2 dark:text-dark-text-2 mt-2">Make it strong — at least 8 characters.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            {...register('confirm')}
            error={errors.confirm?.message}
          />
          <Button type="submit" loading={submitting} fullWidth size="lg">Reset password</Button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to={ROUTES.LOGIN} className="text-text-3 hover:text-primary-600">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

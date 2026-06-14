import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LuArrowLeft, LuKeyRound } from 'react-icons/lu';
import { Button, Input } from '@/components/atoms';
import { authApi } from '@/api/auth.api';
import { ROUTES } from '@/lib/constant';

const schema = z.object({ email: z.string().email('Enter a valid email address') });
type FormInput = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormInput) => {
    setSubmitting(true);
    try {
      await authApi.sendOtp({ email, type: 'password_reset' });
      toast.success('Check your inbox — we sent a reset code');
      navigate(ROUTES.VERIFY_OTP, { state: { email, type: 'password_reset' } });
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not send reset code');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-8 shadow-card">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 mb-4">
            <LuKeyRound className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-text-2 dark:text-dark-text-2 mt-2">
            Enter your account email and we'll send you a 6-digit code to reset it.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Button type="submit" loading={submitting} fullWidth size="lg">
            Send reset code
          </Button>
        </form>

        <Link to={ROUTES.LOGIN} className="mt-6 flex items-center justify-center gap-1.5 text-sm text-text-2 dark:text-dark-text-2 hover:text-primary-600">
          <LuArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    </div>
  );
}

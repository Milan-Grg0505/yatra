import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LuMail, LuShieldCheck } from 'react-icons/lu';
import { Button } from '@/components/atoms';
import { authApi } from '@/api/auth.api';
import { ROUTES } from '@/lib/constant';

const RESEND_SECONDS = 60;

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Email arrives via router state (from Register / ForgotPassword) — fall back to query string
  const stateEmail = (location.state as { email?: string; type?: 'verification' | 'password_reset' } | null)?.email;
  const stateType = (location.state as { email?: string; type?: 'verification' | 'password_reset' } | null)?.type ?? 'verification';
  const searchEmail = new URLSearchParams(location.search).get('email') ?? '';
  const email = stateEmail || searchEmail;

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate(ROUTES.LOGIN, { replace: true });
    inputs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown]);

  const setAt = (i: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    setDigits((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (!pasted.length) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? '';
    setDigits(next);
    inputs.current[Math.min(5, pasted.length - 1)]?.focus();
  };

  const code = digits.join('');
  const valid = code.length === 6;

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      await authApi.verifyOtp({ email, otp: code, type: stateType });
      toast.success(stateType === 'verification' ? 'Email verified!' : 'Code accepted');
      if (stateType === 'password_reset') {
        navigate(ROUTES.RESET_PASSWORD, { state: { email, otp: code } });
      } else {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Invalid code');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    try {
      await authApi.sendOtp({ email, type: stateType });
      toast.success('A new code was sent to your email');
      setCountdown(RESEND_SECONDS);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not resend code');
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-8 shadow-card">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 mb-4">
            <LuShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold">Verify your email</h1>
          <p className="text-sm text-text-2 dark:text-dark-text-2 mt-2 inline-flex items-center gap-1.5">
            <LuMail className="h-4 w-4" /> We sent a 6-digit code to <span className="font-medium text-text dark:text-dark-text">{email}</span>
          </p>
        </div>

        <div className="mt-8 flex justify-between gap-2" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={onKeyDown(i)}
              className="h-14 w-12 text-center text-2xl font-semibold rounded-xl border-2 border-border dark:border-dark-border bg-surface dark:bg-dark-surface-2 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition"
            />
          ))}
        </div>

        <Button onClick={submit} loading={submitting} disabled={!valid} fullWidth size="lg" className="mt-6">
          Verify
        </Button>

        <p className="mt-6 text-center text-sm text-text-2 dark:text-dark-text-2">
          {countdown > 0 ? (
            <>Didn't get it? Resend in <span className="font-medium">{countdown}s</span></>
          ) : (
            <button onClick={resend} className="text-primary-600 font-medium hover:underline">
              Resend code
            </button>
          )}
        </p>
        <p className="mt-2 text-center text-sm">
          <Link to={ROUTES.LOGIN} className="text-text-3 hover:text-primary-600">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

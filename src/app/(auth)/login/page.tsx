'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

const demoAccounts = [
  { label: 'Student', email: 'student@demo.com' },
  { label: 'Teacher', email: 'teacher@demo.com' },
  { label: 'Admin', email: 'admin@demo.com' },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Inline status messages from email verification and OAuth redirects.
  useEffect(() => {
    if (params.get('verified') === '1') toast.success('Email verified — sign in to continue.');
    if (params.get('verify_error') === '1') toast.error('Verification link is invalid or expired.');
    const err = params.get('oauth_error');
    if (err) {
      const map: Record<string, string> = {
        not_configured: 'Google sign-in isn’t configured on this server yet.',
        bad_state: 'Sign-in was interrupted — please try again.',
        exchange_failed: 'Google rejected the sign-in. Please try again.',
        userinfo_failed: 'Could not read your Google profile.',
        unverified: 'Your Google email isn’t verified.',
      };
      toast.error(map[err] ?? 'Google sign-in failed.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      router.push(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'demo1234', { shouldValidate: true });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Welcome back</h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        Sign in to your CompeteIQ account to continue.
      </p>

      {/* Demo accounts */}
      <div className="mt-6 rounded-lg border border-dashed border-border bg-surface-2 p-3">
        <p className="mb-2 text-xs font-medium text-text-secondary">Try a demo account</p>
        <div className="flex gap-2">
          {demoAccounts.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => fillDemo(d.email)}
              className="flex-1 rounded-md border border-border bg-white px-2 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@institute.edu"
          leftIcon={<Mail size={16} />}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" {...register('remember')} />
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={submitting}
          rightIcon={!submitting ? <ArrowRight size={16} /> : undefined}
        >
          Sign In
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <a
        href="/api/auth/google/start"
        className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-white px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path
            fill="#4285F4"
            d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
          />
        </svg>
        Sign in with Google
      </a>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-primary hover:text-primary-dark">
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

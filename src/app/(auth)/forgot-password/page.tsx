'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, MailCheck } from 'lucide-react';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await authApi.forgotPassword(values.email);
      setSentTo(values.email);
    } finally {
      setSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <MailCheck size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-text-primary">Check your email</h1>
        <p className="mt-2 text-sm text-text-secondary">
          We sent a 6-digit reset code to{' '}
          <span className="font-semibold text-text-primary">{sentTo}</span>. Enter it on the next
          screen to set a new password.
        </p>
        <Link href="/reset-password" className="mt-6 block">
          <Button fullWidth size="lg" rightIcon={<ArrowRight size={16} />}>
            Enter reset code
          </Button>
        </Link>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="mt-3 text-sm text-text-muted hover:text-text-secondary"
        >
          Use a different email
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft size={15} /> Back to sign in
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">Forgot password?</h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        Enter your email and we&apos;ll send you a code to reset it.
      </p>

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
        <Button type="submit" fullWidth size="lg" loading={submitting}>
          Send reset code
        </Button>
      </form>
    </div>
  );
}

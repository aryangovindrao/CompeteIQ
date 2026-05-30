'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Lock } from 'lucide-react';
import { authApi } from '@/lib/api';
import { passwordStrength } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '@/components/ui/OtpInput';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ otp?: string; password?: string; confirm?: string }>({});

  const strength = passwordStrength(password);

  const validate = () => {
    const next: typeof errors = {};
    if (otp.length !== 6) next.otp = 'Enter the 6-digit code';
    if (password.length < 8) next.password = 'At least 8 characters';
    if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await authApi.resetPassword(otp, password);
      if (res.ok) {
        toast.success('Password reset. You can now sign in.');
        router.push('/login');
      } else {
        setErrors({ otp: 'Invalid or expired code' });
      }
    } catch {
      toast.error('Could not reset password. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
      >
        <ArrowLeft size={15} /> Back to sign in
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">Reset your password</h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        Enter the 6-digit code we emailed you and choose a new password.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-center text-sm font-medium text-gray-700">
            Verification code
          </label>
          <OtpInput value={otp} onChange={setOtp} />
          {errors.otp && <p className="mt-2 text-center text-xs text-danger">{errors.otp}</p>}
        </div>

        <div>
          <Input
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            leftIcon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-colors"
                    style={{ backgroundColor: i < strength.score ? strength.color : '#E5E7EB' }}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs font-medium" style={{ color: strength.color }}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Re-enter your password"
          leftIcon={<Lock size={16} />}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />

        <motion.div whileTap={{ scale: 0.99 }}>
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Reset password
          </Button>
        </motion.div>
      </form>
    </div>
  );
}

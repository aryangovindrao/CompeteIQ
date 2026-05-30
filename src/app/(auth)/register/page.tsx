'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Building2, Globe, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { passwordStrength } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

const schema = z
  .object({
    instituteName: z.string().min(2, 'Institute name is required'),
    domain: z.string().min(2, 'Domain is required'),
    country: z.string().min(1, 'Select a country'),
    name: z.string().min(2, 'Your name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(1, 'Confirm your password'),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

const steps = [
  { title: 'Institute', fields: ['instituteName', 'domain', 'country'] as const },
  { title: 'Account', fields: ['name', 'email'] as const },
  { title: 'Security', fields: ['password', 'confirm', 'terms'] as const },
];

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'IN', label: 'India' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AE', label: 'United Arab Emirates' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      instituteName: '',
      domain: '',
      country: '',
      name: '',
      email: '',
      password: '',
      confirm: '',
    },
  });

  const pw = watch('password') ?? '';
  const strength = passwordStrength(pw);

  const next = async () => {
    const valid = await trigger(steps[step].fields as unknown as (keyof FormValues)[]);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const user = await registerAccount({
        instituteName: values.instituteName,
        domain: values.domain,
        country: values.country,
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success(`Welcome to CompeteIQ, ${user.name.split(' ')[0]}!`);
      router.push('/dashboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Create your institute</h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        Set up CompeteIQ for your school in three quick steps.
      </p>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.title} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i < step
                    ? 'bg-primary text-white'
                    : i === step
                      ? 'bg-primary text-white ring-4 ring-primary-light'
                      : 'bg-surface-2 text-text-muted'
                }`}
              >
                {i + 1}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-text-muted">
        Step {step + 1} of {steps.length} · {steps[step].title}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {step === 0 && (
              <>
                <Input
                  label="Institute name"
                  placeholder="Northwood Academy"
                  leftIcon={<Building2 size={16} />}
                  error={errors.instituteName?.message}
                  {...register('instituteName')}
                />
                <Input
                  label="Email domain"
                  placeholder="northwood.edu"
                  leftIcon={<Globe size={16} />}
                  hint="Used to auto-verify teachers and students."
                  error={errors.domain?.message}
                  {...register('domain')}
                />
                <Select
                  label="Country"
                  placeholder="Select a country"
                  options={countries}
                  error={errors.country?.message}
                  {...register('country')}
                />
              </>
            )}

            {step === 1 && (
              <>
                <Input
                  label="Your full name"
                  placeholder="Rajesh Kapoor"
                  leftIcon={<UserIcon size={16} />}
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Work email"
                  type="email"
                  placeholder="admin@northwood.edu"
                  leftIcon={<Mail size={16} />}
                  hint="You'll be the institute administrator."
                  error={errors.email?.message}
                  {...register('email')}
                />
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="At least 8 characters"
                    leftIcon={<Lock size={16} />}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  {pw.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1.5 flex-1 rounded-full transition-colors"
                            style={{
                              backgroundColor: i < strength.score ? strength.color : '#E5E7EB',
                            }}
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
                  label="Confirm password"
                  type="password"
                  placeholder="Re-enter your password"
                  leftIcon={<Lock size={16} />}
                  error={errors.confirm?.message}
                  {...register('confirm')}
                />
                <div>
                  <Checkbox
                    label={
                      <span>
                        I agree to the{' '}
                        <Link href="/" className="font-medium text-primary hover:underline">
                          Terms
                        </Link>{' '}
                        and{' '}
                        <Link href="/" className="font-medium text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </span>
                    }
                    {...register('terms')}
                  />
                  {errors.terms?.message && (
                    <p className="mt-1 text-xs text-danger">{errors.terms.message}</p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={back}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              type="button"
              fullWidth
              onClick={next}
              rightIcon={<ArrowRight size={16} />}
            >
              Continue
            </Button>
          ) : (
            <Button type="submit" fullWidth loading={submitting}>
              Create account
            </Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
}

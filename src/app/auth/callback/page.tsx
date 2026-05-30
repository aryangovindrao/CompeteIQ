'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api, tokenStore, userStore } from '@/lib/api';
import type { User } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Hydration page after a successful OAuth redirect. The callback API has
 * already set the cookie; here we read the user and mirror to localStorage
 * so the rest of the SPA picks up the session without a full reload.
 */
export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // The competeiq_token cookie is set by the API; sync localStorage from it.
    const cookieMatch = document.cookie.match(/(?:^|; )competeiq_token=([^;]+)/);
    const token = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
    if (!token) {
      toast.error('Sign-in failed. Please try again.');
      router.replace('/login');
      return;
    }
    tokenStore.set(token);
    api
      .get<User>('/api/auth/me')
      .then((r) => {
        userStore.set(r.data);
        toast.success(`Welcome, ${r.data.name.split(' ')[0]}!`);
        router.replace('/dashboard');
      })
      .catch(() => {
        tokenStore.clear();
        toast.error('Could not load your profile. Please log in again.');
        router.replace('/login');
      });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-2">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-text-secondary">Signing you in…</p>
      </div>
    </div>
  );
}

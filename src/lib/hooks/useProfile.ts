'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api';
import { useAuth } from '../auth';
import type { User } from '../types';

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId ?? 'me'],
    queryFn: () => profileApi.get(userId),
  });
}

export function useBadges() {
  return useQuery({ queryKey: ['profile', 'badges'], queryFn: profileApi.badges });
}

export function useCertificates() {
  return useQuery({ queryKey: ['profile', 'certificates'], queryFn: profileApi.certificates });
}

export function useSkills() {
  return useQuery({ queryKey: ['profile', 'skills'], queryFn: profileApi.skills });
}

export function useActivity() {
  return useQuery({ queryKey: ['profile', 'activity'], queryFn: profileApi.activity });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (payload: Partial<User>) => profileApi.update(payload),
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
}

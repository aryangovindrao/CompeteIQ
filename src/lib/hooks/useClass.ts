'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '../api';

export function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: classesApi.list });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => classesApi.get(id),
    enabled: !!id,
  });
}

export function useClassStudents(id: string) {
  return useQuery({
    queryKey: ['class', id, 'students'],
    queryFn: () => classesApi.students(id),
    enabled: !!id,
  });
}

export function useClassLeaderboard(id: string) {
  return useQuery({
    queryKey: ['class', id, 'leaderboard'],
    queryFn: () => classesApi.leaderboard(id),
    enabled: !!id,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: classesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

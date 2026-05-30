'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { competitionsApi } from '../api';
import type { AnswerInput } from '../types';

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: competitionsApi.list,
  });
}

export function useCompetition(id: string) {
  return useQuery({
    queryKey: ['competition', id],
    queryFn: () => competitionsApi.get(id),
    enabled: !!id,
  });
}

export function useCompetitionQuestions(id: string) {
  return useQuery({
    queryKey: ['competition', id, 'questions'],
    queryFn: () => competitionsApi.questions(id),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useCompetitionResult(id: string) {
  return useQuery({
    queryKey: ['competition', id, 'result'],
    queryFn: () => competitionsApi.result(id),
    enabled: !!id,
  });
}

export function useCompetitionLeaderboard(id: string) {
  return useQuery({
    queryKey: ['competition', id, 'leaderboard'],
    queryFn: () => competitionsApi.leaderboard(id),
    enabled: !!id,
  });
}

export function useSubmitAttempt(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: AnswerInput[]) => competitionsApi.submit(id, answers),
    onSuccess: (attempt) => {
      qc.setQueryData(['competition', id, 'result'], attempt);
    },
  });
}

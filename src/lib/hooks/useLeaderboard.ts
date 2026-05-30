'use client';

import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api';

export function useLeaderboard(scope: 'institute' | 'global') {
  return useQuery({
    queryKey: ['leaderboard', scope],
    queryFn: () => leaderboardApi.get(scope),
  });
}

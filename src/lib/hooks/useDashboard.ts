'use client';

import { useQuery } from '@tanstack/react-query';
import { billingApi, dashboardApi } from '../api';
import type { Role } from '../types';

export function useDashboardStats(role: Role) {
  return useQuery({
    queryKey: ['dashboard', 'stats', role],
    queryFn: () => dashboardApi.stats(role),
  });
}

export function useSubscription() {
  return useQuery({ queryKey: ['billing', 'subscription'], queryFn: billingApi.subscription });
}

export function usePackages() {
  return useQuery({ queryKey: ['billing', 'packages'], queryFn: billingApi.packages });
}

export function useInvoices() {
  return useQuery({ queryKey: ['billing', 'invoices'], queryFn: billingApi.invoices });
}

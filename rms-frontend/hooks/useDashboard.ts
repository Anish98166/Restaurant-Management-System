'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { useAuthContext } from '@/providers/AuthProvider';

export const DASHBOARD_KEYS = {
  analytics: ['dashboard', 'analytics'] as const,
  staffSummary: ['dashboard', 'staff-summary'] as const,
};

export function useDashboardAnalytics() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: DASHBOARD_KEYS.analytics,
    queryFn: dashboardService.getAnalytics,
    refetchInterval: 60000,
    enabled: isAuthenticated,
    retry: false, // don't retry 403s
  });
}

export function useStaffSummary() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: DASHBOARD_KEYS.staffSummary,
    queryFn: dashboardService.getStaffSummary,
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });
}

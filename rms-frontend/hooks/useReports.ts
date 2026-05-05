'use client';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';

export const REPORT_KEYS = {
  revenue: (s: string, e: string) => ['reports', 'revenue', s, e] as const,
  items: (s: string, e: string) => ['reports', 'items', s, e] as const,
  staff: (s: string, e: string) => ['reports', 'staff', s, e] as const,
};

export function useRevenueReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: REPORT_KEYS.revenue(startDate, endDate),
    queryFn: () => reportsService.getRevenue(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 60000,
  });
}

export function useItemPerformanceReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: REPORT_KEYS.items(startDate, endDate),
    queryFn: () => reportsService.getItemPerformance(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 60000,
  });
}

export function useStaffPerformanceReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: REPORT_KEYS.staff(startDate, endDate),
    queryFn: () => reportsService.getStaffPerformance(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 60000,
  });
}

'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { shiftReportService } from '@/services/shift-report.service';

export const SHIFT_KEYS = {
  preview: (date?: string) => ['shift-report', 'preview', date] as const,
  history: () => ['shift-report', 'history'] as const,
};

export function useShiftPreview(date?: string) {
  return useQuery({
    queryKey: SHIFT_KEYS.preview(date),
    queryFn: () => shiftReportService.getPreview(date),
    staleTime: 60000,
  });
}

export function useShiftHistory() {
  return useQuery({
    queryKey: SHIFT_KEYS.history(),
    queryFn: shiftReportService.getHistory,
  });
}

export function useCloseDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date?: string) => shiftReportService.closeDay(date),
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: SHIFT_KEYS.history() });
      queryClient.invalidateQueries({ queryKey: SHIFT_KEYS.preview(report.date) });
      toast.success(`Day ${report.date} closed successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to close day');
    },
  });
}

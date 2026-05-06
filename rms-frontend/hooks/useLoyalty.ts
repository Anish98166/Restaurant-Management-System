'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { loyaltyService } from '@/services/loyalty.service';

export const LOYALTY_KEYS = {
  all: ['loyalty'] as const,
  list: () => [...LOYALTY_KEYS.all, 'list'] as const,
  summary: () => [...LOYALTY_KEYS.all, 'summary'] as const,
  detail: (id: string) => [...LOYALTY_KEYS.all, 'detail', id] as const,
};

export function useLoyaltyCustomers() {
  return useQuery({
    queryKey: LOYALTY_KEYS.list(),
    queryFn: loyaltyService.getAll,
  });
}

export function useLoyaltySummary() {
  return useQuery({
    queryKey: LOYALTY_KEYS.summary(),
    queryFn: loyaltyService.getSummary,
  });
}

export function useRedeemFreeItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => loyaltyService.redeemFreeItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOYALTY_KEYS.all });
      toast.success('Free item redeemed');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to redeem'),
  });
}

'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kdsService } from '@/services/kds.service';

export const KDS_KEYS = {
  active: ['kds', 'active'] as const,
};

export function useKdsOrders() {
  return useQuery({
    queryKey: KDS_KEYS.active,
    queryFn: kdsService.getActiveOrders,
    refetchInterval: 8000, // poll every 8s
    staleTime: 0,
  });
}

export function useBumpOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kdsService.bumpOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KDS_KEYS.active });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

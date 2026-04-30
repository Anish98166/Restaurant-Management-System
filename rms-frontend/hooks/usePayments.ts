'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paymentsService, CreatePaymentData } from '@/services/payments.service';

export const PAYMENT_KEYS = {
  all: ['payments'] as const,
  list: () => [...PAYMENT_KEYS.all, 'list'] as const,
  detail: (id: string) => [...PAYMENT_KEYS.all, 'detail', id] as const,
  unpaid: () => [...PAYMENT_KEYS.all, 'unpaid'] as const,
};

export function usePayments() {
  return useQuery({
    queryKey: PAYMENT_KEYS.list(),
    queryFn: paymentsService.getAll,
  });
}

export function useUnpaidOrders() {
  return useQuery({
    queryKey: PAYMENT_KEYS.unpaid(),
    queryFn: paymentsService.getUnpaidOrders,
    refetchInterval: 30000,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentData) => paymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.unpaid() });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Payment processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    },
  });
}

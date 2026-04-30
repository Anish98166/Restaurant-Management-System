'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersService, OrderFilters, CreateOrderData } from '@/services/orders.service';
import { OrderStatus } from '@/types';

export const ORDER_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDER_KEYS.all, 'list'] as const,
  list: (filters?: OrderFilters) => [...ORDER_KEYS.lists(), filters] as const,
  detail: (id: string) => [...ORDER_KEYS.all, 'detail', id] as const,
};

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ORDER_KEYS.list(filters),
    queryFn: () => ordersService.getAll(filters),
    placeholderData: (prev) => prev,
    refetchInterval: 30000, // Poll every 30s for real-time feel
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ORDER_KEYS.detail(id),
    queryFn: () => ordersService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderData) => ordersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Order created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ORDER_KEYS.lists() });
      const previousData = queryClient.getQueriesData({ queryKey: ORDER_KEYS.lists() });
      // Optimistic update
      queryClient.setQueriesData({ queryKey: ORDER_KEYS.lists() }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((order: any) =>
            order.id === id ? { ...order, status } : order,
          ),
        };
      });
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to update order status');
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(ORDER_KEYS.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Order status updated to ${updated.status.toLowerCase()}`);
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
      toast.success('Order deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    },
  });
}

'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  inventoryService,
  CreateInventoryData,
  UpdateInventoryData,
} from '@/services/inventory.service';

export const INVENTORY_KEYS = {
  all: ['inventory'] as const,
  list: () => [...INVENTORY_KEYS.all, 'list'] as const,
  lowStock: () => [...INVENTORY_KEYS.all, 'low-stock'] as const,
  detail: (id: string) => [...INVENTORY_KEYS.all, 'detail', id] as const,
};

export function useInventory() {
  return useQuery({
    queryKey: INVENTORY_KEYS.list(),
    queryFn: inventoryService.getAll,
    staleTime: 30000,
  });
}

export function useLowStockInventory() {
  return useQuery({
    queryKey: INVENTORY_KEYS.lowStock(),
    queryFn: inventoryService.getLowStock,
    refetchInterval: 60000,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInventoryData) => inventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Inventory item created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create inventory item');
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryData }) =>
      inventoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.list() });
      toast.success('Inventory updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update inventory');
    },
  });
}

export function useRestockInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      inventoryService.restock(id, quantity),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.lowStock() });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success(`Restocked ${updated.menuItem.name} — new stock: ${updated.quantity} ${updated.unit}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restock');
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      inventoryService.adjust(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.lowStock() });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Stock adjusted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Inventory tracking removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove inventory item');
    },
  });
}

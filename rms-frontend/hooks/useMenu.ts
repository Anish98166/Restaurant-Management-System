'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { menuService, MenuItemFilters, CreateMenuItemData } from '@/services/menu.service';
import { useAuthContext } from '@/providers/AuthProvider';

export const MENU_KEYS = {
  all: ['menu'] as const,
  lists: () => [...MENU_KEYS.all, 'list'] as const,
  list: (filters?: MenuItemFilters) => [...MENU_KEYS.lists(), filters] as const,
  detail: (id: string) => [...MENU_KEYS.all, 'detail', id] as const,
};

export function useMenuItems(filters?: MenuItemFilters) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: MENU_KEYS.list(filters),
    queryFn: () => menuService.getAll(filters),
    placeholderData: (prev) => prev,
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
}

export function useMenuItem(id: string) {
  return useQuery({
    queryKey: MENU_KEYS.detail(id),
    queryFn: () => menuService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuItemData) => menuService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_KEYS.lists() });
      toast.success('Menu item created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create menu item');
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMenuItemData> }) =>
      menuService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: MENU_KEYS.lists() });
      queryClient.setQueryData(MENU_KEYS.detail(updated.id), updated);
      toast.success('Menu item updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update menu item');
    },
  });
}

export function useToggleMenuItemAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuService.toggleAvailability(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: MENU_KEYS.lists() });
      const previousData = queryClient.getQueriesData({ queryKey: MENU_KEYS.lists() });
      // Optimistic update
      queryClient.setQueriesData({ queryKey: MENU_KEYS.lists() }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((item: any) =>
            item.id === id ? { ...item, available: !item.available } : item,
          ),
        };
      });
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to toggle availability');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MENU_KEYS.lists() });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_KEYS.lists() });
      toast.success('Menu item deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete menu item');
    },
  });
}

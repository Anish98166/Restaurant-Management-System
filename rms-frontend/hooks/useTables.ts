'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tablesService, CreateTableData } from '@/services/tables.service';
import { TableStatus } from '@/types';
import { useAuthContext } from '@/providers/AuthProvider';

export const TABLE_KEYS = {
  all: ['tables'] as const,
  list: () => [...TABLE_KEYS.all, 'list'] as const,
  detail: (id: string) => [...TABLE_KEYS.all, 'detail', id] as const,
};

export function useTables() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: TABLE_KEYS.list(),
    queryFn: tablesService.getAll,
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });
}

export function useTable(id: string) {
  return useQuery({
    queryKey: TABLE_KEYS.detail(id),
    queryFn: () => tablesService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTableData) => tablesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.list() });
      toast.success('Table created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create table');
    },
  });
}

export function useUpdateTableStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tablesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.list() });
      toast.success('Table status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update table status');
    },
  });
}

export function useDeleteTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tablesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEYS.list() });
      toast.success('Table deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete table');
    },
  });
}

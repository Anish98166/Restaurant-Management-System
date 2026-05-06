'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersService, CreateUserData, UpdateUserData } from '@/services/users.service';

export const USER_KEYS = {
  all: ['users'] as const,
  list: () => [...USER_KEYS.all, 'list'] as const,
  detail: (id: string) => [...USER_KEYS.all, 'detail', id] as const,
  logs: (userId?: string) => [...USER_KEYS.all, 'logs', userId] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.list(),
    queryFn: usersService.getAll,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => usersService.getOne(id),
    enabled: !!id,
  });
}

export function useActivityLogs(userId?: string) {
  return useQuery({
    queryKey: USER_KEYS.logs(userId),
    queryFn: () => usersService.getActivityLogs(userId),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserData) => usersService.create(data),
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list() });
      toast.success(`User ${u.name} created`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create user'),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => usersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list() });
      toast.success('User updated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update user'),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersService.changePassword(id, newPassword),
    onSuccess: () => toast.success('Password changed'),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to change password'),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list() });
      toast.success('User deactivated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to deactivate user'),
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list() });
      toast.success('User reactivated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to activate user'),
  });
}

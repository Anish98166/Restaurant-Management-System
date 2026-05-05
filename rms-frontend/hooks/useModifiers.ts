'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { modifiersService, CreateModifierGroupData, CreateModifierData } from '@/services/modifiers.service';

export const MODIFIER_KEYS = {
  groups: (menuItemId: string) => ['modifiers', menuItemId] as const,
};

export function useModifierGroups(menuItemId: string) {
  return useQuery({
    queryKey: MODIFIER_KEYS.groups(menuItemId),
    queryFn: () => modifiersService.getGroups(menuItemId),
    enabled: !!menuItemId,
  });
}

export function useCreateModifierGroup(menuItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModifierGroupData) => modifiersService.createGroup(menuItemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODIFIER_KEYS.groups(menuItemId) });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Modifier group created');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create group'),
  });
}

export function useUpdateModifierGroup(menuItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: Partial<CreateModifierGroupData> }) =>
      modifiersService.updateGroup(menuItemId, groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODIFIER_KEYS.groups(menuItemId) });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update group'),
  });
}

export function useDeleteModifierGroup(menuItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => modifiersService.deleteGroup(menuItemId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODIFIER_KEYS.groups(menuItemId) });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Modifier group deleted');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete group'),
  });
}

export function useAddModifier(menuItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: CreateModifierData }) =>
      modifiersService.addModifier(menuItemId, groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODIFIER_KEYS.groups(menuItemId) });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Modifier added');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add modifier'),
  });
}

export function useDeleteModifier(menuItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, modifierId }: { groupId: string; modifierId: string }) =>
      modifiersService.deleteModifier(menuItemId, groupId, modifierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODIFIER_KEYS.groups(menuItemId) });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Modifier deleted');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete modifier'),
  });
}

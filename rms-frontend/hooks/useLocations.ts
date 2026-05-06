'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { locationsService, CreateLocationData } from '@/services/locations.service';

export const LOCATION_KEYS = {
  all: ['locations'] as const,
  list: () => [...LOCATION_KEYS.all, 'list'] as const,
  analytics: () => [...LOCATION_KEYS.all, 'analytics'] as const,
};

export function useLocations() {
  return useQuery({ queryKey: LOCATION_KEYS.list(), queryFn: locationsService.getAll });
}

export function useLocationAnalytics() {
  return useQuery({ queryKey: LOCATION_KEYS.analytics(), queryFn: locationsService.getAnalytics, staleTime: 30000 });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLocationData) => locationsService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: LOCATION_KEYS.list() }); toast.success('Location created'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create location'),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => locationsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: LOCATION_KEYS.list() }); toast.success('Location updated'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update location'),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationsService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: LOCATION_KEYS.list() }); toast.success('Location deleted'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete location'),
  });
}

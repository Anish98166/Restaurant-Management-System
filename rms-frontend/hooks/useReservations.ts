'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reservationsService, CreateReservationData } from '@/services/reservations.service';
import { ReservationStatus } from '@/types';

export const RESERVATION_KEYS = {
  all: ['reservations'] as const,
  list: (params?: object) => [...RESERVATION_KEYS.all, 'list', params] as const,
  upcoming: () => [...RESERVATION_KEYS.all, 'upcoming'] as const,
  detail: (id: string) => [...RESERVATION_KEYS.all, 'detail', id] as const,
};

export function useReservations(params?: { date?: string; tableId?: string; status?: string }) {
  return useQuery({
    queryKey: RESERVATION_KEYS.list(params),
    queryFn: () => reservationsService.getAll(params),
    staleTime: 30000,
  });
}

export function useUpcomingReservations() {
  return useQuery({
    queryKey: RESERVATION_KEYS.upcoming(),
    queryFn: reservationsService.getUpcoming,
    refetchInterval: 60000,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReservationData) => reservationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all });
      toast.success('Reservation created');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create reservation'),
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReservationData> }) =>
      reservationsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all });
      toast.success('Reservation updated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update reservation'),
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      reservationsService.updateStatus(id, status),
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success(`Reservation marked as ${r.status.toLowerCase()}`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update status'),
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all });
      toast.success('Reservation deleted');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete reservation'),
  });
}

export function useProcessNoShows() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (minutes?: number) => reservationsService.processNoShows(minutes),
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success(`${r.processed} reservation(s) marked as no-show`);
    },
  });
}

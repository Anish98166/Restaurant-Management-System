import api from '@/lib/axios';
import { Reservation, ReservationStatus } from '@/types';

export interface CreateReservationData {
  tableId: string;
  guestName: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  notes?: string;
}

export const reservationsService = {
  getAll: async (params?: { date?: string; tableId?: string; status?: string }): Promise<Reservation[]> => {
    const { data } = await api.get<Reservation[]>('/reservations', { params });
    return data;
  },

  getUpcoming: async (): Promise<Reservation[]> => {
    const { data } = await api.get<Reservation[]>('/reservations/upcoming');
    return data;
  },

  getOne: async (id: string): Promise<Reservation> => {
    const { data } = await api.get<Reservation>(`/reservations/${id}`);
    return data;
  },

  create: async (payload: CreateReservationData): Promise<Reservation> => {
    const { data } = await api.post<Reservation>('/reservations', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateReservationData>): Promise<Reservation> => {
    const { data } = await api.put<Reservation>(`/reservations/${id}`, payload);
    return data;
  },

  updateStatus: async (id: string, status: ReservationStatus): Promise<Reservation> => {
    const { data } = await api.patch<Reservation>(`/reservations/${id}/status`, { status });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },

  processNoShows: async (minutes?: number): Promise<{ processed: number }> => {
    const { data } = await api.post<{ processed: number }>('/reservations/process-no-shows', {}, {
      params: minutes ? { minutes } : {},
    });
    return data;
  },
};

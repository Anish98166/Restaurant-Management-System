import api from '@/lib/axios';
import { Location, CrossLocationAnalytics } from '@/types';

export interface CreateLocationData {
  name: string;
  address?: string;
  phone?: string;
  timezone?: string;
}

export const locationsService = {
  getAll: async (): Promise<Location[]> => {
    const { data } = await api.get<Location[]>('/locations');
    return data;
  },

  getOne: async (id: string): Promise<Location> => {
    const { data } = await api.get<Location>(`/locations/${id}`);
    return data;
  },

  getAnalytics: async (): Promise<CrossLocationAnalytics> => {
    const { data } = await api.get<CrossLocationAnalytics>('/locations/analytics');
    return data;
  },

  create: async (payload: CreateLocationData): Promise<Location> => {
    const { data } = await api.post<Location>('/locations', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateLocationData> & { active?: boolean }): Promise<Location> => {
    const { data } = await api.put<Location>(`/locations/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/locations/${id}`);
  },
};

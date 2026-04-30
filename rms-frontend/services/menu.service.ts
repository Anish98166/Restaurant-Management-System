import api from '@/lib/axios';
import { MenuItem, PaginatedResponse, MenuCategory } from '@/types';

export interface MenuItemFilters {
  category?: MenuCategory;
  available?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  price: number;
  category: MenuCategory;
  available?: boolean;
  imageUrl?: string;
}

export const menuService = {
  getAll: async (filters?: MenuItemFilters): Promise<PaginatedResponse<MenuItem>> => {
    const { data } = await api.get<PaginatedResponse<MenuItem>>('/menu', { params: filters });
    return data;
  },

  getOne: async (id: string): Promise<MenuItem> => {
    const { data } = await api.get<MenuItem>(`/menu/${id}`);
    return data;
  },

  create: async (payload: CreateMenuItemData): Promise<MenuItem> => {
    const { data } = await api.post<MenuItem>('/menu', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateMenuItemData>): Promise<MenuItem> => {
    const { data } = await api.put<MenuItem>(`/menu/${id}`, payload);
    return data;
  },

  toggleAvailability: async (id: string): Promise<MenuItem> => {
    const { data } = await api.patch<MenuItem>(`/menu/${id}/toggle-availability`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/menu/${id}`);
  },
};

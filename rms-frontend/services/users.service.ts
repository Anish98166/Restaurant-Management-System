import api from '@/lib/axios';
import { User, ActivityLog } from '@/types';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'STAFF';
  phone?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'STAFF';
  phone?: string;
  active?: boolean;
}

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getOne: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  create: async (payload: CreateUserData): Promise<User> => {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },

  update: async (id: string, payload: UpdateUserData): Promise<User> => {
    const { data } = await api.put<User>(`/users/${id}`, payload);
    return data;
  },

  changePassword: async (id: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await api.patch<{ message: string }>(`/users/${id}/password`, { newPassword });
    return data;
  },

  deactivate: async (id: string): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}/deactivate`);
    return data;
  },

  activate: async (id: string): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}/activate`);
    return data;
  },

  getActivityLogs: async (userId?: string): Promise<ActivityLog[]> => {
    const { data } = await api.get<ActivityLog[]>('/users/activity-logs', {
      params: userId ? { userId } : {},
    });
    return data;
  },
};

import api from '@/lib/axios';
import { RestaurantTable, TableStatus } from '@/types';

export interface CreateTableData {
  tableNumber: number;
  capacity: number;
  status?: TableStatus;
}

export const tablesService = {
  getAll: async (): Promise<RestaurantTable[]> => {
    const { data } = await api.get<RestaurantTable[]>('/tables');
    return data;
  },

  getOne: async (id: string): Promise<RestaurantTable> => {
    const { data } = await api.get<RestaurantTable>(`/tables/${id}`);
    return data;
  },

  create: async (payload: CreateTableData): Promise<RestaurantTable> => {
    const { data } = await api.post<RestaurantTable>('/tables', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateTableData>): Promise<RestaurantTable> => {
    const { data } = await api.put<RestaurantTable>(`/tables/${id}`, payload);
    return data;
  },

  updateStatus: async (id: string, status: TableStatus): Promise<RestaurantTable> => {
    const { data } = await api.patch<RestaurantTable>(`/tables/${id}/status`, { status });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};

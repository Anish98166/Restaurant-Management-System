import api from '@/lib/axios';
import { Order } from '@/types';

export const kdsService = {
  getActiveOrders: async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/kds/active');
    return data;
  },

  bumpOrder: async (id: string): Promise<Order> => {
    const { data } = await api.patch<Order>(`/kds/${id}/bump`);
    return data;
  },
};

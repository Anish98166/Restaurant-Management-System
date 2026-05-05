import api from '@/lib/axios';
import { Order, OrderStatus, PaginatedResponse } from '@/types';

export interface OrderFilters {
  status?: OrderStatus;
  tableId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderData {
  tableId: string;
  notes?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
    modifiers?: Array<{ modifierId: string }>;
  }>;
}

export const ordersService = {
  getAll: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const { data } = await api.get<PaginatedResponse<Order>>('/orders', { params: filters });
    return data;
  },

  getOne: async (id: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  create: async (payload: CreateOrderData): Promise<Order> => {
    const { data } = await api.post<Order>('/orders', payload);
    return data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};

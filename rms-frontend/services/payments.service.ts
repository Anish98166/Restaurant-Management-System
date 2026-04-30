import api from '@/lib/axios';
import { Payment, PaymentMethod, PaymentStatus, Order } from '@/types';

export interface CreatePaymentData {
  orderId: string;
  method: PaymentMethod;
  amount?: number;
}

export const paymentsService = {
  getAll: async (): Promise<Payment[]> => {
    const { data } = await api.get<Payment[]>('/payments');
    return data;
  },

  getOne: async (id: string): Promise<Payment> => {
    const { data } = await api.get<Payment>(`/payments/${id}`);
    return data;
  },

  create: async (payload: CreatePaymentData): Promise<Payment> => {
    const { data } = await api.post<Payment>('/payments', payload);
    return data;
  },

  updateStatus: async (id: string, status: PaymentStatus): Promise<Payment> => {
    const { data } = await api.patch<Payment>(`/payments/${id}/status`, { status });
    return data;
  },

  getUnpaidOrders: async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/payments/unpaid-orders');
    return data;
  },
};

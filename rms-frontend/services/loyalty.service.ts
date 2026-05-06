import api from '@/lib/axios';
import { LoyaltyCustomer, LoyaltySummary } from '@/types';

export const loyaltyService = {
  getAll: async (): Promise<LoyaltyCustomer[]> => {
    const { data } = await api.get<LoyaltyCustomer[]>('/loyalty');
    return data;
  },

  getSummary: async (): Promise<LoyaltySummary> => {
    const { data } = await api.get<LoyaltySummary>('/loyalty/summary');
    return data;
  },

  getOne: async (id: string): Promise<LoyaltyCustomer> => {
    const { data } = await api.get<LoyaltyCustomer>(`/loyalty/${id}`);
    return data;
  },

  lookupByPhone: async (phone: string): Promise<LoyaltyCustomer | null> => {
    const { data } = await api.get<LoyaltyCustomer | null>('/loyalty/lookup', { params: { phone } });
    return data;
  },

  redeemFreeItem: async (id: string): Promise<LoyaltyCustomer> => {
    const { data } = await api.patch<LoyaltyCustomer>(`/loyalty/${id}/redeem`);
    return data;
  },
};

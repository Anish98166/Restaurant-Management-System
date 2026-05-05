import api from '@/lib/axios';
import { RevenueReport, ItemPerformanceReport, StaffPerformanceReport } from '@/types';

export const reportsService = {
  getRevenue: async (startDate: string, endDate: string): Promise<RevenueReport> => {
    const { data } = await api.get<RevenueReport>('/reports/revenue', { params: { startDate, endDate } });
    return data;
  },

  getItemPerformance: async (startDate: string, endDate: string): Promise<ItemPerformanceReport> => {
    const { data } = await api.get<ItemPerformanceReport>('/reports/items', { params: { startDate, endDate } });
    return data;
  },

  getStaffPerformance: async (startDate: string, endDate: string): Promise<StaffPerformanceReport> => {
    const { data } = await api.get<StaffPerformanceReport>('/reports/staff', { params: { startDate, endDate } });
    return data;
  },

  exportOrdersCsvUrl: (startDate: string, endDate: string): string =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/reports/export/orders?startDate=${startDate}&endDate=${endDate}`,

  exportPaymentsCsvUrl: (startDate: string, endDate: string): string =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/reports/export/payments?startDate=${startDate}&endDate=${endDate}`,
};

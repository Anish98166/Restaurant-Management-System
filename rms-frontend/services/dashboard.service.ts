import api from '@/lib/axios';
import { DashboardAnalytics } from '@/types';

export interface StaffSummary {
  summary: {
    activeOrders: number;
    todayOrders: number;
    totalTables: number;
    occupiedTables: number;
    unpaidOrders: number;
  };
  recentOrders: DashboardAnalytics['recentOrders'];
  ordersByStatus: DashboardAnalytics['ordersByStatus'];
}

export const dashboardService = {
  getAnalytics: async (): Promise<DashboardAnalytics> => {
    const { data } = await api.get<DashboardAnalytics>('/dashboard/analytics');
    return data;
  },

  getStaffSummary: async (): Promise<StaffSummary> => {
    const { data } = await api.get<StaffSummary>('/dashboard/staff-summary');
    return data;
  },
};

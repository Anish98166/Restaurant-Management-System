import api from '@/lib/axios';
import { DailyReport } from '@/types';

export const shiftReportService = {
  getPreview: async (date?: string): Promise<DailyReport> => {
    const { data } = await api.get<DailyReport>('/shift-report/preview', { params: date ? { date } : {} });
    return data;
  },

  getHistory: async (): Promise<DailyReport[]> => {
    const { data } = await api.get<DailyReport[]>('/shift-report/history');
    return data;
  },

  getOne: async (id: string): Promise<DailyReport> => {
    const { data } = await api.get<DailyReport>(`/shift-report/history/${id}`);
    return data;
  },

  closeDay: async (date?: string): Promise<DailyReport> => {
    const { data } = await api.post<DailyReport>('/shift-report/close', {}, { params: date ? { date } : {} });
    return data;
  },
};

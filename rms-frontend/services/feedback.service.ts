import api from '@/lib/axios';
import axios from 'axios';
import { Feedback, FeedbackSummary, MenuItemRating } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const feedbackService = {
  getAll: async (): Promise<Feedback[]> => {
    const { data } = await api.get<Feedback[]>('/feedback');
    return data;
  },

  getSummary: async (): Promise<FeedbackSummary> => {
    const { data } = await api.get<FeedbackSummary>('/feedback/summary');
    return data;
  },

  getMenuItemRatings: async (): Promise<MenuItemRating[]> => {
    const { data } = await api.get<MenuItemRating[]>('/feedback/menu-ratings');
    return data;
  },

  // Public — no auth token needed
  submitPublic: async (payload: {
    orderId: string;
    rating: number;
    comment?: string;
    customerName?: string;
  }): Promise<Feedback> => {
    const { data } = await axios.post<Feedback>(`${API_BASE}/feedback`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/feedback/${id}`);
  },
};

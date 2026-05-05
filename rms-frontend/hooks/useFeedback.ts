'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { feedbackService } from '@/services/feedback.service';

export const FEEDBACK_KEYS = {
  all: ['feedback'] as const,
  list: () => [...FEEDBACK_KEYS.all, 'list'] as const,
  summary: () => [...FEEDBACK_KEYS.all, 'summary'] as const,
  menuRatings: () => [...FEEDBACK_KEYS.all, 'menu-ratings'] as const,
};

export function useFeedback() {
  return useQuery({
    queryKey: FEEDBACK_KEYS.list(),
    queryFn: feedbackService.getAll,
  });
}

export function useFeedbackSummary() {
  return useQuery({
    queryKey: FEEDBACK_KEYS.summary(),
    queryFn: feedbackService.getSummary,
  });
}

export function useMenuItemRatings() {
  return useQuery({
    queryKey: FEEDBACK_KEYS.menuRatings(),
    queryFn: feedbackService.getMenuItemRatings,
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feedbackService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.all });
      toast.success('Feedback deleted');
    },
  });
}

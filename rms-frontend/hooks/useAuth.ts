'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth } = useAuthContext();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      queryClient.clear();
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthContext();

  return () => {
    clearAuth();
    queryClient.clear();
    router.push('/login');
    toast.success('Logged out successfully');
  };
}

export function useCurrentUser() {
  const { user } = useAuthContext();
  return user;
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
}

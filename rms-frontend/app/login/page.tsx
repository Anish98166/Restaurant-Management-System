'use client';
import { useState } from 'react';
import { ChefHat, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@restaurant.com');
  const [password, setPassword] = useState('admin123');
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4E342E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ChefHat className="w-9 h-9 text-[#FF8A65]" />
          </div>
          <h1 className="text-3xl font-bold text-[#4E342E]">Bistro RMS</h1>
          <p className="text-[#8D6E63] mt-1">Restaurant Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#F5E6D3] p-8">
          <h2 className="text-xl font-semibold text-[#4E342E] mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              placeholder="you@restaurant.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" size="lg" loading={login.isPending}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 bg-[#FFF8F0] rounded-xl border border-[#F5E6D3]">
            <p className="text-xs font-semibold text-[#8D6E63] mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-[#4E342E]">
              <p><span className="font-medium">Admin:</span> admin@restaurant.com / admin123</p>
              <p><span className="font-medium">Staff:</span> staff@restaurant.com / staff123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

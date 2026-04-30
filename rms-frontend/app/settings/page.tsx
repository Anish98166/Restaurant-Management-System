'use client';
import { useState } from 'react';
import { User, Shield, Bell, UserPlus, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useCurrentUser } from '@/hooks/useAuth';
import { useLogin } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const user = useCurrentUser();
  const isAdmin = can.manageUsers(user);

  const [notifications, setNotifications] = useState({
    unpaidOrders: true,
    newOrders: true,
    lowStock: false,
  });

  // New user form (admin only)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [creating, setCreating] = useState(false);

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('All fields are required');
      return;
    }
    setCreating(true);
    try {
      await authService.register(newUser.name, newUser.email, newUser.password, newUser.role);
      toast.success(`User ${newUser.name} created successfully`);
      setNewUser({ name: '', email: '', password: '', role: 'STAFF' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#FF8A65]" />
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#FFF8F0] rounded-xl border border-[#F5E6D3]">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold ${
                isAdmin ? 'bg-[#FF8A65]' : 'bg-[#4E342E]'
              }`}>
                {isAdmin ? <Shield className="w-7 h-7" /> : user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#4E342E] text-lg">{user?.name}</p>
                <p className="text-[#8D6E63]">{user?.email}</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 text-white text-xs rounded-full ${
                  isAdmin ? 'bg-[#FF8A65]' : 'bg-[#4E342E]'
                }`}>
                  {isAdmin ? 'Administrator' : 'Staff Member'}
                </span>
              </div>
            </div>
            <Input label="Display Name" defaultValue={user?.name} disabled />
            <Input label="Email" defaultValue={user?.email} disabled />
            <p className="text-xs text-[#8D6E63]">Profile editing coming soon.</p>
          </div>
        </Card>

        {/* Create User — Admin only */}
        {isAdmin ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FF8A65]" />
                <CardTitle>Create New User</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Jane Smith"
                />
                <Input
                  label="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="jane@restaurant.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min. 6 characters"
                />
                <Select
                  label="Role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  options={[
                    { value: 'STAFF', label: 'Staff' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]}
                />
              </div>
              <Button
                onClick={handleCreateUser}
                loading={creating}
                icon={<UserPlus className="w-4 h-4" />}
              >
                Create User
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#BCAAA4]" />
                <CardTitle>User Management</CardTitle>
              </div>
            </CardHeader>
            <div className="text-center py-8">
              <Lock className="w-10 h-10 mx-auto mb-3 text-[#BCAAA4]" />
              <p className="font-medium text-[#4E342E]">Admin access required</p>
              <p className="text-sm text-[#8D6E63] mt-1">Only administrators can create or manage users</p>
            </div>
          </Card>
        )}

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#FF8A65]" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {[
              { key: 'unpaidOrders', label: 'Unpaid Orders', desc: 'Alert when orders are awaiting payment' },
              { key: 'newOrders', label: 'New Orders', desc: 'Alert when new orders are placed' },
              ...(isAdmin ? [{ key: 'lowStock', label: 'Low Stock', desc: 'Alert when menu items run low' }] : []),
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-[#FFF8F0] border border-[#F5E6D3]">
                <div>
                  <p className="font-medium text-[#4E342E]">{label}</p>
                  <p className="text-sm text-[#8D6E63]">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications[key as keyof typeof notifications] ? 'bg-[#FF8A65]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      notifications[key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* System Info — Admin only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FF8A65]" />
                <CardTitle>System</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Version', value: '1.0.0' },
                { label: 'Backend', value: 'NestJS + PostgreSQL' },
                { label: 'Frontend', value: 'Next.js 15 + TanStack' },
                { label: 'API URL', value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-[#F5E6D3] last:border-0">
                  <span className="text-[#8D6E63]">{label}</span>
                  <span className="font-medium text-[#4E342E]">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

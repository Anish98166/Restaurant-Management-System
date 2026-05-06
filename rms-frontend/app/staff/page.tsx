'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Plus, Edit, UserX, UserCheck, Key,
  Activity, Shield, Clock, ShoppingBag,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useUsers, useCreateUser, useUpdateUser, useDeactivateUser,
  useActivateUser, useChangePassword, useActivityLogs,
} from '@/hooks/useUsers';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { User } from '@/types';
import { format } from 'date-fns';

const ACTION_LABELS: Record<string, string> = {
  ACCOUNT_CREATED: 'Account created',
  ACCOUNT_UPDATED: 'Profile updated',
  ACCOUNT_DEACTIVATED: 'Account deactivated',
  ACCOUNT_ACTIVATED: 'Account reactivated',
  PASSWORD_CHANGED: 'Password changed',
};

export default function StaffPage() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  if (currentUser && !can.manageStaff(currentUser)) { router.push('/dashboard'); return null; }

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [pwdUser, setPwdUser] = useState<User | null>(null);
  const [logsUser, setLogsUser] = useState<User | null>(null);
  const [newPwd, setNewPwd] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF', phone: '' });

  const { data: users = [], isLoading } = useUsers();
  const { data: logs = [], isLoading: logsLoading } = useActivityLogs(logsUser?.id);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deactivate = useDeactivateUser();
  const activate = useActivateUser();
  const changePwd = useChangePassword();

  const resetForm = () => setForm({ name: '', email: '', password: '', role: 'STAFF', phone: '' });

  const handleCreate = async () => {
    await createUser.mutateAsync({ ...form, role: form.role as 'ADMIN' | 'STAFF' });
    setShowCreate(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    await updateUser.mutateAsync({ id: editUser.id, data: { name: form.name, email: form.email, role: form.role as 'ADMIN' | 'STAFF', phone: form.phone } });
    setEditUser(null);
  };

  const openEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone ?? '' });
    setEditUser(u);
  };

  const admins = users.filter((u) => u.role === 'ADMIN');
  const staff = users.filter((u) => u.role === 'STAFF');
  const active = users.filter((u) => u.active).length;

  return (
    <AppLayout title="Staff Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, color: 'bg-[#4E342E] text-white' },
            { label: 'Active', value: active, color: 'bg-green-600 text-white' },
            { label: 'Admins', value: admins.length, color: 'bg-[#FF8A65] text-white' },
            { label: 'Staff', value: staff.length, color: 'bg-blue-600 text-white' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-4 py-3 ${s.color}`}>
              <p className="text-xs opacity-80">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-[#4E342E] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF8A65]" /> All Users
          </h2>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { resetForm(); setShowCreate(true); }}>
            Add User
          </Button>
        </div>

        {/* Users Table */}
        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5E6D3]">
                  <tr>
                    {['Name', 'Email', 'Role', 'Phone', 'Orders', 'Last Login', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-[#4E342E] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className={`border-t border-[#F5E6D3] transition-colors ${u.active ? 'hover:bg-[#FFF8F0]' : 'bg-gray-50 opacity-60'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.role === 'ADMIN' ? 'bg-[#FF8A65]' : 'bg-[#4E342E]'}`}>
                            {u.role === 'ADMIN' ? <Shield className="w-4 h-4" /> : u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-[#4E342E]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#8D6E63]">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === 'ADMIN' ? 'warning' : 'default'}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[#8D6E63]">{u.phone ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[#8D6E63]">
                          <ShoppingBag className="w-3.5 h-3.5" />{u._count?.orders ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8D6E63] text-xs">
                        {u.lastLoginAt ? format(new Date(u.lastLoginAt), 'MMM d, HH:mm') : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.active ? 'success' : 'error'}>{u.active ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => openEdit(u)} />
                          <Button size="sm" variant="ghost" icon={<Key className="w-3.5 h-3.5" />} onClick={() => { setPwdUser(u); setNewPwd(''); }} />
                          <Button size="sm" variant="ghost" icon={<Activity className="w-3.5 h-3.5" />} onClick={() => setLogsUser(u)} />
                          {u.id !== currentUser?.id && (
                            u.active
                              ? <Button size="sm" variant="ghost" icon={<UserX className="w-3.5 h-3.5" />} onClick={() => { if (confirm(`Deactivate ${u.name}?`)) deactivate.mutate(u.id); }} className="text-red-400 hover:text-red-600" />
                              : <Button size="sm" variant="ghost" icon={<UserCheck className="w-3.5 h-3.5" />} onClick={() => activate.mutate(u.id)} className="text-green-500 hover:text-green-700" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New User">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
            <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@restaurant.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Password *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" />
          </div>
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={[{ value: 'STAFF', label: 'Staff' }, { value: 'ADMIN', label: 'Admin' }]} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} loading={createUser.isPending} disabled={!form.name || !form.email || !form.password} className="flex-1">Create User</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit — ${editUser?.name}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" />
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={[{ value: 'STAFF', label: 'Staff' }, { value: 'ADMIN', label: 'Admin' }]} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditUser(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleUpdate} loading={updateUser.isPending} className="flex-1">Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={!!pwdUser} onClose={() => setPwdUser(null)} title={`Change Password — ${pwdUser?.name}`}>
        <div className="space-y-4">
          <Input label="New Password *" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Min. 6 characters" />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setPwdUser(null)} className="flex-1">Cancel</Button>
            <Button onClick={async () => { if (!pwdUser || newPwd.length < 6) return; await changePwd.mutateAsync({ id: pwdUser.id, newPassword: newPwd }); setPwdUser(null); }} loading={changePwd.isPending} disabled={newPwd.length < 6} className="flex-1">Update Password</Button>
          </div>
        </div>
      </Modal>

      {/* Activity Logs Modal */}
      <Modal isOpen={!!logsUser} onClose={() => setLogsUser(null)} title={`Activity — ${logsUser?.name}`} size="lg">
        {logsLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-[#8D6E63]">
            <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 bg-[#FFF8F0] rounded-xl px-3 py-2.5 border border-[#F5E6D3]">
                <Clock className="w-4 h-4 text-[#8D6E63] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#4E342E]">{ACTION_LABELS[log.action] ?? log.action}</p>
                  {log.details && <p className="text-xs text-[#8D6E63]">{log.details}</p>}
                </div>
                <span className="text-xs text-[#BCAAA4] shrink-0">{format(new Date(log.createdAt), 'MMM d, HH:mm')}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

'use client';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MenuTable } from '@/components/menu/MenuTable';
import { MenuItemModal } from '@/components/menu/MenuItemModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useMenuItems } from '@/hooks/useMenu';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { MenuItem, MenuCategory } from '@/types';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'APPETIZER', label: 'Appetizer' },
  { value: 'MAIN_COURSE', label: 'Main Course' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'BEVERAGE', label: 'Beverage' },
  { value: 'SPECIAL', label: 'Special' },
];

export default function MenuPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MenuCategory | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const user = useCurrentUser();
  const canManage = can.manageMenu(user);

  const { data, isLoading } = useMenuItems({
    search: search || undefined,
    category: category || undefined,
    limit: 100,
  });

  const handleEdit = (item: MenuItem) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditItem(null);
  };

  return (
    <AppLayout title="Menu Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="w-56"
            />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as MenuCategory | '')}
              options={CATEGORY_OPTIONS}
              className="w-44"
            />
          </div>
          {canManage && (
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Add Item
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3 flex-wrap">
          <div className="px-4 py-2 rounded-xl text-sm font-medium bg-[#4E342E] text-white">
            Total: {data?.meta.total ?? 0}
          </div>
          <div className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white">
            Available: {data?.data.filter((i) => i.available).length ?? 0}
          </div>
          <div className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white">
            Unavailable: {data?.data.filter((i) => !i.available).length ?? 0}
          </div>
        </div>

        <Card>
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : (
            <MenuTable items={data?.data ?? []} onEdit={handleEdit} isAdmin={canManage} />
          )}
        </Card>
      </div>

      <MenuItemModal isOpen={showModal} onClose={handleClose} editItem={editItem} />
    </AppLayout>
  );
}

'use client';
import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { CreateOrderModal } from '@/components/orders/CreateOrderModal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useOrders } from '@/hooks/useOrders';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { OrderStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'SERVED', label: 'Served' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [showCreate, setShowCreate] = useState(false);
  const user = useCurrentUser();

  const { data, isLoading, refetch, isFetching } = useOrders(
    statusFilter ? { status: statusFilter } : undefined,
  );

  return (
    <AppLayout title="Orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
              options={STATUS_OPTIONS}
              className="w-44"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
          {can.createOrder(user) && (
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
              New Order
            </Button>
          )}
        </div>

        {/* Summary chips */}
        <div className="flex gap-3 flex-wrap">
          <div className="px-4 py-2 rounded-xl text-sm font-medium bg-[#4E342E] text-white">
            Total: {data?.meta.total ?? 0}
          </div>
        </div>

        {/* Table */}
        <Card>
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : (
            <OrdersTable
              orders={data?.data ?? []}
              canDelete={can.deleteOrder(user)}
              canCancel={can.cancelOrder(user)}
            />
          )}
        </Card>
      </div>

      <CreateOrderModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </AppLayout>
  );
}

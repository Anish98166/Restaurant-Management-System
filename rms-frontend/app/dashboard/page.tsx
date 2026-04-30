'use client';
import { DollarSign, ShoppingBag, Table2, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OrderStatusChart } from '@/components/dashboard/OrderStatusChart';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useDashboardAnalytics, useStaffSummary } from '@/hooks/useDashboard';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { format } from 'date-fns';

export default function DashboardPage() {
  const user = useCurrentUser();
  const isAdmin = can.viewFullAnalytics(user);

  const adminQuery = useDashboardAnalytics();
  const staffQuery = useStaffSummary();

  // Use the right data source based on role
  const isLoading = isAdmin ? adminQuery.isLoading : staffQuery.isLoading;
  const error = isAdmin ? adminQuery.error : staffQuery.error;

  const summary = isAdmin ? adminQuery.data?.summary : staffQuery.data?.summary;
  const recentOrders = isAdmin ? adminQuery.data?.recentOrders : staffQuery.data?.recentOrders;
  const ordersByStatus = isAdmin ? adminQuery.data?.ordersByStatus : staffQuery.data?.ordersByStatus;

  if (error) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-[#4E342E] font-medium">Failed to load dashboard</p>
            <p className="text-[#8D6E63] text-sm mt-1">Make sure the backend is running</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Role badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isAdmin
              ? 'bg-[#4E342E] text-white'
              : 'bg-[#FF8A65]/20 text-[#FF8A65] border border-[#FF8A65]/30'
          }`}>
            {isAdmin ? '👑 Admin View' : '👤 Staff View'}
          </span>
          {!isAdmin && (
            <span className="text-xs text-[#8D6E63]">Revenue data is visible to admins only</span>
          )}
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
          {isAdmin && (
            <StatCard
              title="Today's Revenue"
              value={isLoading ? '...' : `$${(summary as any)?.todayRevenue?.toFixed(2) ?? '0.00'}`}
              subtitle="Total paid today"
              icon={DollarSign}
              color="orange"
              loading={isLoading}
            />
          )}
          <StatCard
            title="Active Orders"
            value={isLoading ? '...' : summary?.activeOrders ?? 0}
            subtitle="Pending + Preparing + Served"
            icon={ShoppingBag}
            color="brown"
            loading={isLoading}
          />
          <StatCard
            title="Tables Occupied"
            value={isLoading ? '...' : `${summary?.occupiedTables ?? 0}/${summary?.totalTables ?? 0}`}
            subtitle="Currently in use"
            icon={Table2}
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="Unpaid Orders"
            value={isLoading ? '...' : summary?.unpaidOrders ?? 0}
            subtitle="Awaiting payment"
            icon={AlertCircle}
            color={summary?.unpaidOrders ? 'red' : 'green'}
            loading={isLoading}
          />
        </div>

        {/* Charts — Admin only */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-[#F5E6D3] p-6 h-72 skeleton" />
              ) : (
                <RevenueChart data={adminQuery.data?.weeklyRevenue ?? []} />
              )}
            </div>
            <div>
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-[#F5E6D3] p-6 h-72 skeleton" />
              ) : (
                <OrderStatusChart data={ordersByStatus ?? []} />
              )}
            </div>
          </div>
        )}

        {/* Staff: order status chart only */}
        {!isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-[#F5E6D3] p-6 h-72 skeleton" />
              ) : (
                <OrderStatusChart data={ordersByStatus ?? []} />
              )}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {[
                  { label: 'Orders today', value: summary?.todayOrders ?? 0 },
                  { label: 'Active orders', value: summary?.activeOrders ?? 0 },
                  { label: 'Tables occupied', value: `${summary?.occupiedTables ?? 0} / ${summary?.totalTables ?? 0}` },
                  { label: 'Awaiting payment', value: summary?.unpaidOrders ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-[#F5E6D3] last:border-0">
                    <span className="text-sm text-[#8D6E63]">{label}</span>
                    <span className="font-semibold text-[#4E342E]">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Bottom row */}
        <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-2' : ''} gap-6`}>
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FF8A65]" />
                <CardTitle>Recent Orders</CardTitle>
              </div>
            </CardHeader>
            {isLoading ? (
              <TableSkeleton rows={4} />
            ) : (
              <div className="space-y-3">
                {recentOrders?.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FFF8F0] border border-[#F5E6D3]">
                    <div>
                      <p className="font-medium text-[#4E342E] text-sm">
                        Order #{order.orderNumber} — Table {order.table?.tableNumber}
                      </p>
                      <p className="text-xs text-[#8D6E63]">
                        {format(new Date(order.createdAt), 'HH:mm')} · {order.items.length} item(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      {isAdmin && (
                        <span className="font-semibold text-[#4E342E] text-sm">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {!recentOrders?.length && (
                  <p className="text-center text-[#8D6E63] py-6 text-sm">No orders yet today</p>
                )}
              </div>
            )}
          </Card>

          {/* Top Menu Items — Admin only */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FF8A65]" />
                  <CardTitle>Top Menu Items</CardTitle>
                </div>
              </CardHeader>
              {isLoading ? (
                <TableSkeleton rows={4} />
              ) : (
                <div className="space-y-3">
                  {adminQuery.data?.topMenuItems.map((item, i) => (
                    <div key={item.menuItemId} className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF8F0] border border-[#F5E6D3]">
                      <div className="w-7 h-7 bg-[#FF8A65] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#4E342E] text-sm truncate">{item.menuItem?.name}</p>
                        <p className="text-xs text-[#8D6E63]">{item.menuItem?.category.replace('_', ' ')}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#4E342E]">{item._sum.quantity} sold</span>
                    </div>
                  ))}
                  {!adminQuery.data?.topMenuItems.length && (
                    <p className="text-center text-[#8D6E63] py-6 text-sm">No sales data yet</p>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

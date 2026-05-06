'use client';
import { useState } from 'react';
import { CreditCard, AlertCircle, Lock, Receipt } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PaymentModal } from '@/components/billing/PaymentModal';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PrintButton } from '@/components/ui/PrintButton';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useUnpaidOrders, usePayments } from '@/hooks/usePayments';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { Order } from '@/types';
import { format } from 'date-fns';

export default function BillingPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const user = useCurrentUser();
  const canViewHistory = can.viewPaymentHistory(user);
  const canProcess = can.processPayment(user);

  const { data: unpaidOrders = [], isLoading: loadingUnpaid } = useUnpaidOrders();
  // Only fetch payment history if admin
  const { data: payments = [], isLoading: loadingPayments } = usePayments();

  return (
    <AppLayout title="Billing">
      <div className="space-y-6">
        {/* Unpaid Orders — visible to all staff */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <CardTitle>Unpaid Orders</CardTitle>
              {unpaidOrders.length > 0 && (
                <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {unpaidOrders.length} pending
                </span>
              )}
            </div>
          </CardHeader>
          {loadingUnpaid ? (
            <TableSkeleton rows={3} />
          ) : unpaidOrders.length === 0 ? (
            <div className="text-center py-10 text-[#8D6E63]">
              <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>All orders are paid up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unpaidOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-orange-50 border border-orange-200"
                >
                  <div>
                    <p className="font-semibold text-[#4E342E]">
                      Order #{order.orderNumber} — Table {order.table?.tableNumber}
                    </p>
                    <p className="text-sm text-[#8D6E63]">
                      {order.items.length} item(s) · {format(new Date(order.createdAt), 'HH:mm')}
                    </p>
                    {/* Show item breakdown */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {order.items.slice(0, 3).map((item) => (
                        <span key={item.id} className="text-xs bg-white border border-orange-200 rounded-full px-2 py-0.5 text-[#4E342E]">
                          {item.menuItem.name} ×{item.quantity}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-[#8D6E63]">+{order.items.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-bold text-[#4E342E]">${order.totalAmount.toFixed(2)}</span>
                    {canProcess && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<CreditCard className="w-4 h-4" />}
                        onClick={() => setSelectedOrder(order)}
                      >
                        Pay
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Payment History — Admin only */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Payment History</CardTitle>
              {!canViewHistory && (
                <span className="ml-auto flex items-center gap-1 text-xs text-[#8D6E63]">
                  <Lock className="w-3 h-3" /> Admin only
                </span>
              )}
            </div>
          </CardHeader>

          {!canViewHistory ? (
            <div className="text-center py-12">
              <Lock className="w-10 h-10 mx-auto mb-3 text-[#BCAAA4]" />
              <p className="font-medium text-[#4E342E]">Payment history is restricted</p>
              <p className="text-sm text-[#8D6E63] mt-1">Only admins can view full payment records</p>
            </div>
          ) : loadingPayments ? (
            <TableSkeleton rows={5} />
          ) : payments.length === 0 ? (
            <p className="text-center py-8 text-[#8D6E63]">No payments recorded yet</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#F5E6D3]">
              <table className="w-full text-sm">
                <thead className="bg-[#F5E6D3]">
                  <tr>
                    {['Order', 'Table', 'Amount', 'Method', 'Status', 'Date', 'Receipt'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-[#4E342E]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr key={payment.id} className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-[#4E342E]">
                        #{payment.order?.orderNumber}
                      </td>
                      <td className="px-4 py-3">Table {payment.order?.table?.tableNumber}</td>
                      <td className="px-4 py-3 font-semibold text-[#4E342E]">${payment.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 capitalize">{payment.method.toLowerCase()}</td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="px-4 py-3 text-[#8D6E63]">
                        {format(new Date(payment.createdAt), 'MMM d, HH:mm')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a href={`/receipt/${payment.id}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#FF8A65] hover:text-[#FF7043] font-medium transition-colors">
                            <Receipt className="w-3.5 h-3.5" /> View
                          </a>
                          <PrintButton type="receipt" id={payment.id} />
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

      <PaymentModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </AppLayout>
  );
}

'use client';
import { Bell } from 'lucide-react';
import { useUnpaidOrders } from '@/hooks/usePayments';
import { useOrders } from '@/hooks/useOrders';
import { useState } from 'react';
import Link from 'next/link';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: unpaidOrders = [] } = useUnpaidOrders();
  const { data: activeOrdersData } = useOrders({ status: 'PENDING' });

  const notifications = [
    ...unpaidOrders.map((o) => ({
      id: `unpaid-${o.id}`,
      message: `Table ${o.table?.tableNumber} — Order #${o.orderNumber} awaiting payment`,
      type: 'warning' as const,
      href: '/billing',
    })),
    ...(activeOrdersData?.data?.slice(0, 3).map((o) => ({
      id: `pending-${o.id}`,
      message: `New order #${o.orderNumber} at Table ${o.table?.tableNumber}`,
      type: 'info' as const,
      href: '/orders',
    })) ?? []),
  ];

  const totalCount = notifications.length;

  return (
    <header className="h-16 bg-white border-b border-[#F5E6D3] flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <h2 className="text-xl font-semibold text-[#4E342E]">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-[#F5E6D3] text-[#8D6E63] hover:text-[#4E342E] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF8A65] text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-[#F5E6D3] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F5E6D3]">
                  <h3 className="font-semibold text-[#4E342E]">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[#8D6E63] text-sm">
                    All caught up! 🎉
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setShowNotifications(false)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-[#FFF8F0] border-b border-[#F5E6D3] last:border-0 transition-colors`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                        <p className="text-sm text-[#4E342E]">{n.message}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

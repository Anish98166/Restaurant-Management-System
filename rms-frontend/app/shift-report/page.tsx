'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck, TrendingUp, ShoppingBag, CreditCard,
  CheckCircle, XCircle, Lock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useShiftPreview, useShiftHistory, useCloseDay } from '@/hooks/useShiftReport';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { DailyReport } from '@/types';

function StatBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-2xl p-4 border ${color}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

function ReportView({ report, isClosed = false }: { report: DailyReport; isClosed?: boolean }) {
  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Total Orders" value={String(report.totalOrders)} color="bg-[#FFF8F0] border-[#F5E6D3] text-[#4E342E]" />
        <StatBox label="Completed" value={String(report.completedOrders)} color="bg-green-50 border-green-200 text-green-800" />
        <StatBox label="Cancelled" value={String(report.cancelledOrders)} color="bg-red-50 border-red-200 text-red-800" />
        <StatBox label="Revenue" value={`$${report.totalRevenue.toFixed(2)}`} color="bg-amber-50 border-amber-200 text-amber-800" />
      </div>

      {/* Payment breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-[#4E342E] mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#FF8A65]" /> Payment Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {report.paymentBreakdown.map((p) => (
            <div key={p.method} className="bg-white rounded-xl border border-[#F5E6D3] p-3 text-center">
              <p className="text-xs text-[#8D6E63] font-medium">{p.method}</p>
              <p className="text-lg font-bold text-[#4E342E]">${p.amount.toFixed(2)}</p>
              <p className="text-xs text-[#8D6E63]">{p.count} payment{p.count !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top items */}
      {report.topItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#4E342E] mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF8A65]" /> Top Selling Items
          </h3>
          <div className="bg-white rounded-xl border border-[#F5E6D3] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F5E6D3]">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-[#4E342E]">Item</th>
                  <th className="px-4 py-2 text-right font-semibold text-[#4E342E]">Qty Sold</th>
                  <th className="px-4 py-2 text-right font-semibold text-[#4E342E]">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.topItems.map((item, i) => (
                  <tr key={i} className="border-t border-[#F5E6D3]">
                    <td className="px-4 py-2 text-[#4E342E] font-medium">{item.name}</td>
                    <td className="px-4 py-2 text-right text-[#8D6E63]">{item.quantity}</td>
                    <td className="px-4 py-2 text-right font-semibold text-[#FF8A65]">${item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <Lock className="w-3.5 h-3.5" />
          Archived on {new Date(report.closedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function HistoryItem({ report }: { report: DailyReport }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-[#F5E6D3] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FFF8F0] transition-colors"
      >
        <div className="flex items-center gap-3">
          <CalendarCheck className="w-5 h-5 text-[#FF8A65]" />
          <div className="text-left">
            <p className="font-semibold text-[#4E342E]">{report.date}</p>
            <p className="text-xs text-[#8D6E63]">
              {report.totalOrders} orders · ${report.totalRevenue.toFixed(2)} revenue
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3.5 h-3.5" />{report.completedOrders}
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <XCircle className="w-3.5 h-3.5" />{report.cancelledOrders}
            </span>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-[#8D6E63]" /> : <ChevronDown className="w-4 h-4 text-[#8D6E63]" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-[#F5E6D3]">
          <div className="pt-4">
            <ReportView report={report} isClosed />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShiftReportPage() {
  const router = useRouter();
  const user = useCurrentUser();
  if (user && !can.manageInventory(user)) {
    router.push('/dashboard');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const { data: preview, isLoading: previewLoading } = useShiftPreview();
  const { data: history = [], isLoading: historyLoading } = useShiftHistory();
  const closeDay = useCloseDay();

  const todayClosed = history.some((r) => r.date === today);

  return (
    <AppLayout title="Shift Report">
      <div className="space-y-6 max-w-4xl">

        {/* Today's preview */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#4E342E] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#FF8A65]" />
                Today — {today}
              </h2>
              <p className="text-sm text-[#8D6E63] mt-0.5">Live summary of today's activity</p>
            </div>
            {!todayClosed ? (
              <Button
                icon={<Lock className="w-4 h-4" />}
                onClick={() => {
                  if (confirm('Close today\'s shift? This will archive the report and cannot be undone.')) {
                    closeDay.mutate(undefined);
                  }
                }}
                loading={closeDay.isPending}
                variant="secondary"
              >
                Close Day
              </Button>
            ) : (
              <span className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <Lock className="w-4 h-4" /> Day Closed
              </span>
            )}
          </div>

          {previewLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : preview ? (
            <ReportView report={preview} isClosed={todayClosed} />
          ) : null}
        </Card>

        {/* History */}
        <div>
          <h2 className="text-base font-bold text-[#4E342E] mb-3 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#FF8A65]" />
            Past Reports
          </h2>
          {historyLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-[#8D6E63] bg-white rounded-2xl border border-[#F5E6D3]">
              <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No archived reports yet. Close a day to create the first one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((r) => <HistoryItem key={r.id} report={r} />)}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

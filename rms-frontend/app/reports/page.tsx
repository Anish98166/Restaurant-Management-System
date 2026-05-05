'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, Download, TrendingUp, TrendingDown, Users, DollarSign, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRevenueReport, useItemPerformanceReport, useStaffPerformanceReport } from '@/hooks/useReports';
import { reportsService } from '@/services/reports.service';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { format, subDays } from 'date-fns';

const today = new Date().toISOString().split('T')[0];
const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];

const PRESETS = [
  { label: 'Today', start: today, end: today },
  { label: 'Last 7 days', start: subDays(new Date(), 7).toISOString().split('T')[0], end: today },
  { label: 'Last 30 days', start: thirtyDaysAgo, end: today },
  { label: 'This month', start: today.slice(0, 8) + '01', end: today },
];

export default function ReportsPage() {
  const router = useRouter();
  const user = useCurrentUser();
  if (user && !can.viewReports(user)) { router.push('/dashboard'); return null; }

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [activeTab, setActiveTab] = useState<'revenue' | 'items' | 'staff'>('revenue');

  const { data: revenue, isLoading: revLoading } = useRevenueReport(startDate, endDate);
  const { data: items, isLoading: itemsLoading } = useItemPerformanceReport(startDate, endDate);
  const { data: staff, isLoading: staffLoading } = useStaffPerformanceReport(startDate, endDate);

  const handleExport = (type: 'orders' | 'payments') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rms_token') : '';
    const url = type === 'orders'
      ? reportsService.exportOrdersCsvUrl(startDate, endDate)
      : reportsService.exportPaymentsCsvUrl(startDate, endDate);
    // Open with token in header isn't possible via anchor — use fetch + blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${type}-${startDate}-${endDate}.csv`;
        a.click();
      });
  };

  return (
    <AppLayout title="Reports & Export">
      <div className="space-y-6">
        {/* Date range + presets */}
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-end gap-3">
              <Input label="From" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
              <Input label="To" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => { setStartDate(p.start); setEndDate(p.end); }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${startDate === p.start && endDate === p.end ? 'bg-[#4E342E] text-white border-[#4E342E]' : 'bg-white text-[#4E342E] border-[#E8D5C4] hover:border-[#FF8A65]'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="ghost" icon={<Download className="w-4 h-4" />} onClick={() => handleExport('orders')}>Orders CSV</Button>
              <Button size="sm" variant="ghost" icon={<Download className="w-4 h-4" />} onClick={() => handleExport('payments')}>Payments CSV</Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F5E6D3] rounded-xl p-1 w-fit">
          {(['revenue', 'items', 'staff'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === t ? 'bg-white text-[#4E342E] shadow-sm' : 'text-[#8D6E63] hover:text-[#4E342E]'}`}>
              {t === 'items' ? 'Menu Items' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-5">
            {revLoading ? <Skeleton className="h-48 rounded-2xl" /> : revenue ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `$${revenue.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
                    { label: 'Total Orders', value: revenue.totalOrders, icon: BarChart2, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Completed', value: revenue.completedOrders, icon: TrendingUp, color: 'text-[#4E342E] bg-[#FFF8F0]' },
                    { label: 'Cancelled', value: revenue.cancelledOrders, icon: TrendingDown, color: 'text-red-600 bg-red-50' },
                  ].map((s) => (
                    <Card key={s.label} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-[#8D6E63]">{s.label}</p>
                          <p className="text-xl font-bold text-[#4E342E]">{s.value}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Payment method breakdown */}
                <Card>
                  <h3 className="font-semibold text-[#4E342E] mb-4">Payment Methods</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(revenue.byMethod).map(([method, amount]) => (
                      <div key={method} className="text-center bg-[#FFF8F0] rounded-xl p-3 border border-[#F5E6D3]">
                        <p className="text-xs text-[#8D6E63] font-medium">{method}</p>
                        <p className="text-xl font-bold text-[#4E342E]">${(amount as number).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Daily revenue chart */}
                {revenue.daily.length > 1 && (
                  <Card>
                    <h3 className="font-semibold text-[#4E342E] mb-4">Daily Revenue</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={revenue.daily}>
                        <defs>
                          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF8A65" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FF8A65" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#FF8A65" fill="url(#rev)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {itemsLoading ? <Skeleton className="h-64 rounded-2xl col-span-2" /> : items ? (
              <>
                <Card>
                  <h3 className="font-semibold text-[#4E342E] mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" /> Best Sellers
                  </h3>
                  <div className="space-y-2">
                    {items.best.map((item, i) => (
                      <div key={item.menuItemId} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#F5E6D3] text-[#4E342E] text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#4E342E] truncate">{item.name}</p>
                          <p className="text-xs text-[#8D6E63]">{item.category.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-[#4E342E]">{item.quantity} sold</p>
                          <p className="text-xs text-[#FF8A65]">${item.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <h3 className="font-semibold text-[#4E342E] mb-4 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" /> Worst Sellers
                  </h3>
                  <div className="space-y-2">
                    {items.worst.map((item, i) => (
                      <div key={item.menuItemId} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-50 text-red-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#4E342E] truncate">{item.name}</p>
                          <p className="text-xs text-[#8D6E63]">{item.category.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-[#4E342E]">{item.quantity} sold</p>
                          <p className="text-xs text-[#FF8A65]">${item.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : null}
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <Card>
            {staffLoading ? <Skeleton className="h-48 rounded-xl" /> : staff ? (
              <>
                <h3 className="font-semibold text-[#4E342E] mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF8A65]" /> Staff Performance
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[#F5E6D3]">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F5E6D3]">
                      <tr>
                        {['Staff', 'Role', 'Total Orders', 'Completed', 'Cancelled', 'Revenue'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-[#4E342E]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {staff.staff.map((s) => (
                        <tr key={s.staffId} className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0]">
                          <td className="px-4 py-3 font-medium text-[#4E342E]">{s.name}</td>
                          <td className="px-4 py-3"><Badge variant={s.role === 'ADMIN' ? 'warning' : 'default'}>{s.role}</Badge></td>
                          <td className="px-4 py-3 font-bold">{s.totalOrders}</td>
                          <td className="px-4 py-3 text-green-600">{s.completedOrders}</td>
                          <td className="px-4 py-3 text-red-500">{s.cancelledOrders}</td>
                          <td className="px-4 py-3 font-semibold text-[#FF8A65]">${s.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

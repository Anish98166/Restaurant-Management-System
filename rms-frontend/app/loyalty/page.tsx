'use client';
import { useRouter } from 'next/navigation';
import { Gift, Star, TrendingUp, Users, Phone, Mail, CheckCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLoyaltyCustomers, useLoyaltySummary, useRedeemFreeItem } from '@/hooks/useLoyalty';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { format } from 'date-fns';

export default function LoyaltyPage() {
  const router = useRouter();
  const user = useCurrentUser();
  if (user && !can.viewLoyalty(user)) { router.push('/dashboard'); return null; }

  const [search, setSearch] = useState('');
  const { data: customers = [], isLoading } = useLoyaltyCustomers();
  const { data: summary } = useLoyaltySummary();
  const redeem = useRedeemFreeItem();

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.phone.includes(q) ||
      (c.name?.toLowerCase().includes(q)) ||
      (c.email?.toLowerCase().includes(q))
    );
  });

  const freeItemReady = customers.filter((c) => c.freeItemEarned && !c.freeItemUsed);

  return (
    <AppLayout title="Loyalty Programme">
      <div className="space-y-6">
        {/* Summary stats */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4E342E] rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#8D6E63]">Total Members</p>
                  <p className="text-2xl font-bold text-[#4E342E]">{summary.totalCustomers}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-[#8D6E63]">Free Items Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{summary.freeItemsPending}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-[#8D6E63]">Loyalty Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${summary.totalLoyaltyRevenue.toFixed(0)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-[#8D6E63]">Avg Visits</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.avgVisits}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Free items alert */}
        {freeItemReady.length > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Gift className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-semibold">{freeItemReady.length} customer{freeItemReady.length !== 1 ? 's' : ''}</span> have a free item ready to redeem.
              {summary && <span className="ml-1 opacity-70">Free item awarded every {summary.freeItemThreshold} visits.</span>}
            </p>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="max-w-sm"
          />
          <span className="text-sm text-[#8D6E63]">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Customers table */}
        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#8D6E63]">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No loyalty members yet</p>
              <p className="text-sm mt-1">Members are created automatically when customers order via QR and provide their phone number.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5E6D3]">
                  <tr>
                    {['Customer', 'Contact', 'Visits', 'Total Spend', 'Last Visit', 'Free Item', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-[#4E342E] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const freeReady = c.freeItemEarned && !c.freeItemUsed;
                    return (
                      <tr key={c.id} className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#4E342E]">{c.name ?? 'Anonymous'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <p className="flex items-center gap-1 text-[#8D6E63]"><Phone className="w-3 h-3" />{c.phone}</p>
                            {c.email && <p className="flex items-center gap-1 text-[#8D6E63]"><Mail className="w-3 h-3" />{c.email}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-full max-w-[80px] bg-[#F5E6D3] rounded-full h-2">
                              <div
                                className="bg-[#FF8A65] h-2 rounded-full"
                                style={{ width: `${Math.min(100, (c.visitCount % (summary?.freeItemThreshold ?? 5)) / (summary?.freeItemThreshold ?? 5) * 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-[#4E342E]">{c.visitCount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#FF8A65]">${c.totalSpend.toFixed(2)}</td>
                        <td className="px-4 py-3 text-[#8D6E63] text-xs">
                          {c.lastVisitAt ? format(new Date(c.lastVisitAt), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {freeReady ? (
                            <Badge variant="warning">🎁 Ready</Badge>
                          ) : c.freeItemEarned && c.freeItemUsed ? (
                            <Badge variant="default">Used</Badge>
                          ) : (
                            <span className="text-xs text-[#BCAAA4]">
                              {(summary?.freeItemThreshold ?? 5) - (c.visitCount % (summary?.freeItemThreshold ?? 5))} more visits
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {freeReady && (
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={<CheckCircle className="w-3.5 h-3.5" />}
                              loading={redeem.isPending && redeem.variables === c.id}
                              onClick={() => {
                                if (confirm(`Redeem free item for ${c.name ?? c.phone}?`)) {
                                  redeem.mutate(c.id);
                                }
                              }}
                            >
                              Redeem
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

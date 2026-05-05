'use client';
import { useRouter } from 'next/navigation';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useFeedback, useFeedbackSummary, useMenuItemRatings, useDeleteFeedback } from '@/hooks/useFeedback';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { format } from 'date-fns';

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${sz} ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const router = useRouter();
  const user = useCurrentUser();
  if (user && !can.viewFeedback(user)) { router.push('/dashboard'); return null; }

  const { data: feedbacks = [], isLoading } = useFeedback();
  const { data: summary } = useFeedbackSummary();
  const { data: menuRatings = [] } = useMenuItemRatings();
  const deleteFeedback = useDeleteFeedback();

  return (
    <AppLayout title="Customer Feedback">
      <div className="space-y-6">
        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-xs text-[#8D6E63] mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-[#4E342E]">{summary.totalReviews}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-[#8D6E63] mb-2">Average Rating</p>
              <p className="text-3xl font-bold text-amber-500 mb-1">{summary.avgRating}</p>
              <StarDisplay rating={Math.round(summary.avgRating)} size="lg" />
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[#8D6E63] mb-3">Rating Distribution</p>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.distribution[star] ?? 0;
                const pct = summary.totalReviews ? Math.round((count / summary.totalReviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#8D6E63] w-4">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 bg-[#F5E6D3] rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-[#8D6E63] w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Item Ratings */}
          <Card className="lg:col-span-1">
            <h3 className="font-semibold text-[#4E342E] mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-[#FF8A65]" /> Item Ratings
            </h3>
            {menuRatings.length === 0 ? (
              <p className="text-sm text-[#8D6E63] text-center py-4">No ratings yet</p>
            ) : (
              <div className="space-y-3">
                {menuRatings.slice(0, 10).map((item) => (
                  <div key={item.menuItemId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#4E342E] truncate">{item.name}</p>
                      <p className="text-xs text-[#8D6E63]">{item.count} review{item.count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-[#4E342E]">{item.avgRating}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* All Reviews */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-semibold text-[#4E342E] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF8A65]" /> All Reviews
            </h3>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
            ) : feedbacks.length === 0 ? (
              <Card>
                <div className="text-center py-10 text-[#8D6E63]">
                  <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No feedback yet. It appears after customers complete QR orders.</p>
                </div>
              </Card>
            ) : (
              feedbacks.map((fb) => (
                <div key={fb.id} className="bg-white rounded-2xl border border-[#F5E6D3] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <StarDisplay rating={fb.rating} />
                        <span className="text-xs text-[#8D6E63]">
                          {fb.customerName || 'Anonymous'} · Order #{fb.order?.orderNumber} · Table {fb.order?.table?.tableNumber}
                        </span>
                      </div>
                      {fb.comment && <p className="text-sm text-[#4E342E] mt-1">"{fb.comment}"</p>}
                      <p className="text-xs text-[#BCAAA4] mt-1">
                        {format(new Date(fb.createdAt), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => { if (confirm('Delete this review?')) deleteFeedback.mutate(fb.id); }}
                      className="text-red-400 hover:text-red-600 shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

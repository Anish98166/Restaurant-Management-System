'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ChefHat, Clock, CheckCircle, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useKdsOrders, useBumpOrder } from '@/hooks/useKds';
import { PrintButton } from '@/components/ui/PrintButton';
import { Order, OrderStatus } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; badge: string }> = {
  PENDING:   { label: 'New Order',  bg: 'bg-red-50',    border: 'border-red-400',    text: 'text-red-700',    badge: 'bg-red-500 text-white' },
  PREPARING: { label: 'Preparing',  bg: 'bg-amber-50',  border: 'border-amber-400',  text: 'text-amber-700',  badge: 'bg-amber-500 text-white' },
  SERVED:    { label: 'Ready',      bg: 'bg-green-50',  border: 'border-green-400',  text: 'text-green-700',  badge: 'bg-green-500 text-white' },
};

const BUMP_LABEL: Record<string, string> = {
  PENDING:   'Start Preparing →',
  PREPARING: 'Mark Ready →',
  SERVED:    'Complete ✓',
};

function elapsed(createdAt: string) {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}m ${s}s`;
}

function useElapsedTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
}

function OrderCard({ order, onBump, bumping }: { order: Order; onBump: () => void; bumping: boolean }) {
  useElapsedTick();
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const ageSeconds = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
  const isUrgent = order.status === 'PENDING' && ageSeconds > 300; // 5 min

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} flex flex-col shadow-md ${isUrgent ? 'ring-2 ring-red-500 ring-offset-2 animate-pulse' : ''}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${cfg.border}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className="font-bold text-gray-800 text-lg">#{order.orderNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span className={isUrgent ? 'text-red-600 font-bold' : ''}>{elapsed(order.createdAt)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 pt-2 pb-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Table {order.table?.tableNumber ?? '—'}
        </span>
        {order.notes && (
          <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-2 py-1 mt-1">
            📝 {order.notes}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-2 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {item.quantity}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm leading-tight">{item.menuItem?.name}</p>
              {item.modifiers && item.modifiers.length > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  + {item.modifiers.map((m) => m.name).join(', ')}
                </p>
              )}
              {item.notes && (
                <p className="text-xs text-amber-600 italic mt-0.5">"{item.notes}"</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bump button */}
      <div className="px-4 pb-4 pt-2 space-y-2">
        <PrintButton type="order" id={order.id} label="Print Ticket" className="w-full justify-center" />
        <button
          onClick={onBump}
          disabled={bumping}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
            order.status === 'SERVED'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-800 hover:bg-gray-900 text-white'
          } disabled:opacity-50`}
        >
          {bumping ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Updating…
            </span>
          ) : (
            BUMP_LABEL[order.status]
          )}
        </button>
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const { data: orders = [], isLoading, refetch, isFetching } = useKdsOrders();
  const bump = useBumpOrder();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrderIds = useRef<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playAlert = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, [soundEnabled]);

  // Detect new orders and play sound
  useEffect(() => {
    if (!orders.length) return;
    const currentIds = new Set(orders.map((o) => o.id));
    const isFirstLoad = prevOrderIds.current.size === 0;
    if (!isFirstLoad) {
      const newOrders = orders.filter((o) => !prevOrderIds.current.has(o.id) && o.status === 'PENDING');
      if (newOrders.length > 0) playAlert();
    }
    prevOrderIds.current = currentIds;
  }, [orders, playAlert]);

  const pending = orders.filter((o) => o.status === 'PENDING');
  const preparing = orders.filter((o) => o.status === 'PREPARING');
  const served = orders.filter((o) => o.status === 'SERVED');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Kitchen Display</h1>
            <p className="text-gray-400 text-xs">{orders.length} active order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />{pending.length} New</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />{preparing.length} Preparing</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />{served.length} Ready</span>
          </div>
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors"
            title={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <CheckCircle className="w-16 h-16 mb-4 text-green-500 opacity-50" />
          <p className="text-xl font-semibold">All caught up!</p>
          <p className="text-sm mt-1">No active orders right now.</p>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Sort: PENDING first, then PREPARING, then SERVED, oldest first within each */}
          {[...pending, ...preparing, ...served].map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onBump={() => bump.mutate(order.id)}
              bumping={bump.isPending && bump.variables === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

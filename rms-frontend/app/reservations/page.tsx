'use client';
import { useState } from 'react';
import { Plus, Calendar, Clock, Users, Phone, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useReservations, useCreateReservation, useUpdateReservation,
  useUpdateReservationStatus, useDeleteReservation, useProcessNoShows,
} from '@/hooks/useReservations';
import { useTables } from '@/hooks/useTables';
import { useCurrentUser } from '@/hooks/useAuth';
import { Reservation, ReservationStatus } from '@/types';
import { format, addDays } from 'date-fns';

const STATUS_CONFIG: Record<ReservationStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  CONFIRMED: { label: 'Confirmed', variant: 'info' },
  SEATED:    { label: 'Seated',    variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'error' },
  NO_SHOW:   { label: 'No Show',   variant: 'warning' },
};

const NEXT_ACTIONS: Partial<Record<ReservationStatus, { label: string; status: ReservationStatus }[]>> = {
  CONFIRMED: [
    { label: 'Seat Guest', status: 'SEATED' },
    { label: 'Cancel', status: 'CANCELLED' },
    { label: 'No Show', status: 'NO_SHOW' },
  ],
  SEATED: [{ label: 'Complete', status: 'COMPLETED' }],
};

const today = new Date().toISOString().split('T')[0];

function ReservationCard({ r, onEdit, onDelete, onStatusChange, canManage }: {
  r: Reservation;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: ReservationStatus) => void;
  canManage: boolean;
}) {
  const cfg = STATUS_CONFIG[r.status];
  const actions = NEXT_ACTIONS[r.status] ?? [];
  const isPast = r.date < today && r.status === 'CONFIRMED';

  return (
    <div className={`bg-white rounded-2xl border p-4 space-y-3 ${isPast ? 'border-orange-300' : 'border-[#F5E6D3]'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[#4E342E]">{r.guestName}</p>
          <p className="text-xs text-[#8D6E63]">Table {r.table?.tableNumber}</p>
        </div>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-[#8D6E63]">
        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{r.date}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{r.time}</span>
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{r.partySize} guests</span>
        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{r.phone}</span>
      </div>
      {r.notes && <p className="text-xs text-[#8D6E63] italic bg-[#FFF8F0] rounded-lg px-2 py-1">"{r.notes}"</p>}
      {canManage && (
        <div className="flex flex-wrap gap-2 pt-1">
          {actions.map((a) => (
            <Button key={a.status} size="sm" variant={a.status === 'CANCELLED' || a.status === 'NO_SHOW' ? 'danger' : 'secondary'} onClick={() => onStatusChange(a.status)}>
              {a.label}
            </Button>
          ))}
          {r.status === 'CONFIRMED' && (
            <Button size="sm" variant="ghost" icon={<Edit className="w-3.5 h-3.5" />} onClick={onEdit} />
          )}
          <Button size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={onDelete} className="text-red-400 hover:text-red-600" />
        </div>
      )}
    </div>
  );
}

export default function ReservationsPage() {
  const user = useCurrentUser();
  const canManage = !!user;

  const [dateFilter, setDateFilter] = useState(today);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Reservation | null>(null);

  const [form, setForm] = useState({
    tableId: '', guestName: '', phone: '', partySize: '2',
    date: today, time: '19:00', notes: '',
  });

  const { data: reservations = [], isLoading } = useReservations({
    date: dateFilter || undefined,
    status: statusFilter || undefined,
  });
  const { data: tables = [] } = useTables();
  const createRes = useCreateReservation();
  const updateRes = useUpdateReservation();
  const updateStatus = useUpdateReservationStatus();
  const deleteRes = useDeleteReservation();
  const processNoShows = useProcessNoShows();

  const resetForm = () => setForm({ tableId: '', guestName: '', phone: '', partySize: '2', date: today, time: '19:00', notes: '' });

  const handleSubmit = async () => {
    const payload = { ...form, partySize: Number(form.partySize) };
    if (editItem) {
      await updateRes.mutateAsync({ id: editItem.id, data: payload });
      setEditItem(null);
    } else {
      await createRes.mutateAsync(payload);
      setShowCreate(false);
      resetForm();
    }
  };

  const openEdit = (r: Reservation) => {
    setForm({ tableId: r.tableId, guestName: r.guestName, phone: r.phone, partySize: String(r.partySize), date: r.date, time: r.time, notes: r.notes ?? '' });
    setEditItem(r);
  };

  // Group by date for calendar-style view
  const grouped: Record<string, Reservation[]> = {};
  for (const r of reservations) {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  }

  const stats = {
    confirmed: reservations.filter((r) => r.status === 'CONFIRMED').length,
    seated: reservations.filter((r) => r.status === 'SEATED').length,
    noShow: reservations.filter((r) => r.status === 'NO_SHOW').length,
  };

  const tableOptions = tables.map((t) => ({ value: t.id, label: `Table ${t.tableNumber} (${t.capacity} seats)` }));

  const FormFields = () => (
    <div className="space-y-4">
      <Select label="Table *" value={form.tableId} onChange={(e) => setForm({ ...form, tableId: e.target.value })} options={tableOptions} placeholder="Select table" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Guest Name *" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} placeholder="John Smith" />
        <Input label="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Party Size *" type="number" min="1" max="50" value={form.partySize} onChange={(e) => setForm({ ...form, partySize: e.target.value })} />
        <Input label="Date *" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input label="Time *" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      </div>
      <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Special requests, allergies…" />
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={() => { setShowCreate(false); setEditItem(null); resetForm(); }} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} loading={createRes.isPending || updateRes.isPending} disabled={!form.tableId || !form.guestName || !form.phone} className="flex-1">
          {editItem ? 'Update' : 'Create Reservation'}
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout title="Reservations">
      <div className="space-y-6">
        {/* Stats */}
        <div className="flex gap-3 flex-wrap">
          <div className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-50 border border-blue-200 text-blue-700">Confirmed: <b>{stats.confirmed}</b></div>
          <div className="px-4 py-2 rounded-xl text-sm font-medium bg-green-50 border border-green-200 text-green-700">Seated: <b>{stats.seated}</b></div>
          {stats.noShow > 0 && <div className="px-4 py-2 rounded-xl text-sm font-medium bg-orange-50 border border-orange-200 text-orange-700">No-shows: <b>{stats.noShow}</b></div>}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-44" />
            <Button variant="ghost" size="sm" onClick={() => setDateFilter('')}>All Dates</Button>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
              { value: '', label: 'All Statuses' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'SEATED', label: 'Seated' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
              { value: 'NO_SHOW', label: 'No Show' },
            ]} className="w-40" />
            <Button variant="ghost" size="sm" icon={<AlertTriangle className="w-3.5 h-3.5" />} onClick={() => processNoShows.mutate(30)} loading={processNoShows.isPending}>
              Process No-Shows
            </Button>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>New Reservation</Button>
        </div>

        {/* Reservations */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : reservations.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-[#8D6E63]">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reservations found</p>
              <p className="text-sm mt-1">Create one to get started</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-[#4E342E] mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF8A65]" />
                  {date === today ? 'Today' : format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d')}
                  <span className="text-[#8D6E63] font-normal">({items.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.sort((a, b) => a.time.localeCompare(b.time)).map((r) => (
                    <ReservationCard
                      key={r.id}
                      r={r}
                      canManage={canManage}
                      onEdit={() => openEdit(r)}
                      onDelete={() => { if (confirm('Delete this reservation?')) deleteRes.mutate(r.id); }}
                      onStatusChange={(status) => updateStatus.mutate({ id: r.id, status })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="New Reservation">
        <FormFields />
      </Modal>
      <Modal isOpen={!!editItem} onClose={() => { setEditItem(null); resetForm(); }} title="Edit Reservation">
        <FormFields />
      </Modal>
    </AppLayout>
  );
}

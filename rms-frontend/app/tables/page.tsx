'use client';
import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TableStatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTables, useCreateTable, useUpdateTableStatus, useDeleteTable } from '@/hooks/useTables';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { TableStatus, RestaurantTable } from '@/types';

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'CLEANING', label: 'Cleaning' },
];

const STATUS_COLORS: Record<TableStatus, string> = {
  AVAILABLE: 'border-green-300 bg-green-50',
  OCCUPIED: 'border-red-300 bg-red-50',
  RESERVED: 'border-orange-300 bg-orange-50',
  CLEANING: 'border-blue-300 bg-blue-50',
};

export default function TablesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [newStatus, setNewStatus] = useState<TableStatus>('AVAILABLE');

  const { data: tables = [], isLoading } = useTables();
  const createTable = useCreateTable();
  const updateStatus = useUpdateTableStatus();
  const deleteTable = useDeleteTable();
  const user = useCurrentUser();
  const canManage = can.manageTables(user);
  const canUpdateStatus = can.updateTableStatus(user);

  const handleCreate = async () => {
    if (!tableNumber || !capacity) return;
    await createTable.mutateAsync({ tableNumber: Number(tableNumber), capacity: Number(capacity) });
    setTableNumber('');
    setCapacity('');
    setShowCreate(false);
  };

  const handleStatusUpdate = async () => {
    if (!selectedTable) return;
    await updateStatus.mutateAsync({ id: selectedTable.id, status: newStatus });
    setSelectedTable(null);
  };

  const stats = {
    available: tables.filter((t) => t.status === 'AVAILABLE').length,
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    reserved: tables.filter((t) => t.status === 'RESERVED').length,
    cleaning: tables.filter((t) => t.status === 'CLEANING').length,
  };

  return (
    <AppLayout title="Table Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            {Object.entries(stats).map(([status, count]) => (
              <div key={status} className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-[#F5E6D3] text-[#4E342E]">
                {status.charAt(0).toUpperCase() + status.slice(1)}: <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
          {canManage && (
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
              Add Table
            </Button>
          )}
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map((table) => (
              <Card
                key={table.id}
                hover={canUpdateStatus}
                className={`border-2 ${STATUS_COLORS[table.status]} ${canUpdateStatus ? 'cursor-pointer' : ''}`}
                onClick={canUpdateStatus ? () => {
                  setSelectedTable(table);
                  setNewStatus(table.status);
                } : undefined}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#4E342E] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">{table.tableNumber}</span>
                  </div>
                  <p className="font-semibold text-[#4E342E] mb-1">Table {table.tableNumber}</p>
                  <div className="flex items-center justify-center gap-1 text-[#8D6E63] text-xs mb-2">
                    <Users className="w-3 h-3" />
                    <span>{table.capacity} seats</span>
                  </div>
                  <TableStatusBadge status={table.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Table Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Table">
        <div className="space-y-4">
          <Input
            label="Table Number"
            type="number"
            min="1"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="e.g. 9"
          />
          <Input
            label="Capacity (seats)"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 4"
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} loading={createTable.isPending} className="flex-1">Add Table</Button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={!!selectedTable}
        onClose={() => setSelectedTable(null)}
        title={`Table ${selectedTable?.tableNumber}`}
      >
        <div className="space-y-4">
          <div className="bg-[#FFF8F0] rounded-xl p-4 border border-[#F5E6D3]">
            <div className="flex justify-between mb-2">
              <span className="text-[#8D6E63]">Capacity</span>
              <span className="font-medium text-[#4E342E]">{selectedTable?.capacity} seats</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8D6E63]">Current Status</span>
              {selectedTable && <TableStatusBadge status={selectedTable.status} />}
            </div>
          </div>
          <Select
            label="Update Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as TableStatus)}
            options={STATUS_OPTIONS}
          />
          <div className="flex gap-3">
            {canManage && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Delete this table?')) {
                    deleteTable.mutate(selectedTable!.id);
                    setSelectedTable(null);
                  }
                }}
              >
                Delete
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSelectedTable(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleStatusUpdate} loading={updateStatus.isPending} className="flex-1">
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck, Plus, Edit, Trash2, Package, ShoppingCart,
  CheckCircle, Send, XCircle, ChevronDown, ChevronUp, Phone, Mail,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useSuppliers, usePurchaseOrders, useCreateSupplier, useUpdateSupplier,
  useDeleteSupplier, useCreatePurchaseOrder, useUpdatePOStatus, useReceivePO, useDeletePO,
} from '@/hooks/useSuppliers';
import { useInventory } from '@/hooks/useInventory';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { Supplier, PurchaseOrder, PurchaseOrderStatus } from '@/types';
import { format } from 'date-fns';

const PO_STATUS_CONFIG: Record<PurchaseOrderStatus, { label: string; variant: 'default' | 'info' | 'success' | 'error' | 'warning' }> = {
  DRAFT:     { label: 'Draft',     variant: 'default' },
  SENT:      { label: 'Sent',      variant: 'info' },
  RECEIVED:  { label: 'Received',  variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'error' },
};

function POCard({ po, onReceive, onUpdateStatus, onDelete, receiving }: {
  po: PurchaseOrder;
  onReceive: () => void;
  onUpdateStatus: (s: PurchaseOrderStatus) => void;
  onDelete: () => void;
  receiving: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cfg = PO_STATUS_CONFIG[po.status];

  return (
    <div className="bg-white rounded-2xl border border-[#F5E6D3] overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FFF8F0] transition-colors">
        <div className="flex items-center gap-3 text-left">
          <ShoppingCart className="w-4 h-4 text-[#FF8A65] shrink-0" />
          <div>
            <p className="font-semibold text-[#4E342E] text-sm">{po.supplier.name}</p>
            <p className="text-xs text-[#8D6E63]">{po.items.length} item{po.items.length !== 1 ? 's' : ''} · ${po.totalCost.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
          <span className="text-xs text-[#BCAAA4]">{format(new Date(po.createdAt), 'MMM d')}</span>
          {open ? <ChevronUp className="w-4 h-4 text-[#8D6E63]" /> : <ChevronDown className="w-4 h-4 text-[#8D6E63]" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#F5E6D3] px-4 py-3 space-y-3">
          <div className="space-y-1">
            {po.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[#4E342E]">{item.inventoryItem.menuItem.name}</span>
                <span className="text-[#8D6E63]">{item.quantity} {item.inventoryItem.unit} × ${item.unitCost.toFixed(2)}</span>
              </div>
            ))}
          </div>
          {po.notes && <p className="text-xs text-[#8D6E63] italic">"{po.notes}"</p>}
          <div className="flex gap-2 flex-wrap pt-1">
            {po.status === 'DRAFT' && (
              <>
                <Button size="sm" variant="secondary" icon={<Send className="w-3.5 h-3.5" />} onClick={() => onUpdateStatus('SENT')}>Mark Sent</Button>
                <Button size="sm" variant="danger" icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => onUpdateStatus('CANCELLED')}>Cancel</Button>
                <Button size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={onDelete} className="text-red-400" />
              </>
            )}
            {po.status === 'SENT' && (
              <>
                <Button size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={onReceive} loading={receiving}>Receive All</Button>
                <Button size="sm" variant="danger" icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => onUpdateStatus('CANCELLED')}>Cancel</Button>
              </>
            )}
            {(po.status === 'RECEIVED' || po.status === 'CANCELLED') && (
              <span className="text-xs text-[#8D6E63]">
                {po.status === 'RECEIVED' ? `Received ${po.receivedAt ? format(new Date(po.receivedAt), 'MMM d, yyyy') : ''}` : 'Cancelled'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuppliersPage() {
  const router = useRouter();
  const user = useCurrentUser();
  if (user && !can.manageSuppliers(user)) { router.push('/dashboard'); return null; }

  const [tab, setTab] = useState<'suppliers' | 'orders'>('suppliers');
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [showCreatePO, setShowCreatePO] = useState(false);

  const [supplierForm, setSupplierForm] = useState({ name: '', contactName: '', phone: '', email: '', address: '', notes: '' });
  const [poForm, setPoForm] = useState({ supplierId: '', notes: '', items: [{ inventoryItemId: '', quantity: '1', unitCost: '0' }] });

  const { data: suppliers = [], isLoading: suppLoading } = useSuppliers();
  const { data: pos = [], isLoading: posLoading } = usePurchaseOrders();
  const { data: inventory = [] } = useInventory();

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const createPO = useCreatePurchaseOrder();
  const updatePOStatus = useUpdatePOStatus();
  const receivePO = useReceivePO();
  const deletePO = useDeletePO();

  const handleCreateSupplier = async () => {
    await createSupplier.mutateAsync({ ...supplierForm });
    setShowCreateSupplier(false);
    setSupplierForm({ name: '', contactName: '', phone: '', email: '', address: '', notes: '' });
  };

  const handleUpdateSupplier = async () => {
    if (!editSupplier) return;
    await updateSupplier.mutateAsync({ id: editSupplier.id, data: supplierForm });
    setEditSupplier(null);
  };

  const handleCreatePO = async () => {
    const validItems = poForm.items.filter((i) => i.inventoryItemId && Number(i.quantity) > 0);
    if (!poForm.supplierId || validItems.length === 0) return;
    await createPO.mutateAsync({
      supplierId: poForm.supplierId,
      notes: poForm.notes || undefined,
      items: validItems.map((i) => ({ inventoryItemId: i.inventoryItemId, quantity: Number(i.quantity), unitCost: Number(i.unitCost) })),
    });
    setShowCreatePO(false);
    setPoForm({ supplierId: '', notes: '', items: [{ inventoryItemId: '', quantity: '1', unitCost: '0' }] });
  };

  const openEditSupplier = (s: Supplier) => {
    setSupplierForm({ name: s.name, contactName: s.contactName ?? '', phone: s.phone ?? '', email: s.email ?? '', address: s.address ?? '', notes: s.notes ?? '' });
    setEditSupplier(s);
  };

  const SupplierForm = () => (
    <div className="space-y-4">
      <Input label="Supplier Name *" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} placeholder="e.g. Fresh Farms Co." />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Contact Name" value={supplierForm.contactName} onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })} placeholder="John Smith" />
        <Input label="Phone" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} placeholder="+1234567890" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} placeholder="supplier@example.com" />
        <Input label="Address" value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} placeholder="123 Main St" />
      </div>
      <Input label="Notes" value={supplierForm.notes} onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })} placeholder="Optional notes…" />
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={() => { setShowCreateSupplier(false); setEditSupplier(null); }} className="flex-1">Cancel</Button>
        <Button onClick={editSupplier ? handleUpdateSupplier : handleCreateSupplier}
          loading={createSupplier.isPending || updateSupplier.isPending}
          disabled={!supplierForm.name} className="flex-1">
          {editSupplier ? 'Save Changes' : 'Create Supplier'}
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout title="Suppliers & Purchase Orders">
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#F5E6D3] rounded-xl p-1 w-fit">
          {(['suppliers', 'orders'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-[#4E342E] shadow-sm' : 'text-[#8D6E63] hover:text-[#4E342E]'}`}>
              {t === 'suppliers' ? `Suppliers (${suppliers.length})` : `Purchase Orders (${pos.length})`}
            </button>
          ))}
        </div>

        {/* Suppliers Tab */}
        {tab === 'suppliers' && (
          <>
            <div className="flex justify-end">
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateSupplier(true)}>Add Supplier</Button>
            </div>
            {suppLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
            ) : suppliers.length === 0 ? (
              <Card><div className="text-center py-12 text-[#8D6E63]"><Truck className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No suppliers yet. Add one to start creating purchase orders.</p></div></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((s) => (
                  <Card key={s.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-[#4E342E]">{s.name}</p>
                        {s.contactName && <p className="text-xs text-[#8D6E63]">{s.contactName}</p>}
                      </div>
                      <Badge variant={s.active ? 'success' : 'error'}>{s.active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-[#8D6E63]">
                      {s.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>}
                      {s.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</p>}
                      {s._count && <p className="flex items-center gap-1"><Package className="w-3 h-3" />{s._count.supplierItems} item{s._count.supplierItems !== 1 ? 's' : ''} · {s._count.purchaseOrders} PO{s._count.purchaseOrders !== 1 ? 's' : ''}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => openEditSupplier(s)} className="flex-1">Edit</Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => { if (confirm(`Delete ${s.name}?`)) deleteSupplier.mutate(s.id); }}
                        className="text-red-400 hover:text-red-600" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Purchase Orders Tab */}
        {tab === 'orders' && (
          <>
            <div className="flex justify-end">
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreatePO(true)} disabled={suppliers.length === 0}>New Purchase Order</Button>
            </div>
            {posLoading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
            ) : pos.length === 0 ? (
              <Card><div className="text-center py-12 text-[#8D6E63]"><ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No purchase orders yet.</p></div></Card>
            ) : (
              <div className="space-y-2">
                {pos.map((po) => (
                  <POCard key={po.id} po={po}
                    onReceive={() => receivePO.mutate({ id: po.id })}
                    onUpdateStatus={(s) => updatePOStatus.mutate({ id: po.id, status: s })}
                    onDelete={() => { if (confirm('Delete this purchase order?')) deletePO.mutate(po.id); }}
                    receiving={receivePO.isPending && (receivePO.variables as any)?.id === po.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Supplier Modal */}
      <Modal isOpen={showCreateSupplier} onClose={() => setShowCreateSupplier(false)} title="Add Supplier"><SupplierForm /></Modal>
      <Modal isOpen={!!editSupplier} onClose={() => setEditSupplier(null)} title={`Edit — ${editSupplier?.name}`}><SupplierForm /></Modal>

      {/* Create PO Modal */}
      <Modal isOpen={showCreatePO} onClose={() => setShowCreatePO(false)} title="New Purchase Order" size="lg">
        <div className="space-y-4">
          <Select label="Supplier *" value={poForm.supplierId} onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
            options={suppliers.map((s) => ({ value: s.id, label: s.name }))} placeholder="Select supplier" />
          <Input label="Notes" value={poForm.notes} onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })} placeholder="Optional notes…" />

          <div>
            <p className="text-sm font-medium text-[#4E342E] mb-2">Items *</p>
            <div className="space-y-2">
              {poForm.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 items-end">
                  <Select value={item.inventoryItemId}
                    onChange={(e) => { const items = [...poForm.items]; items[idx].inventoryItemId = e.target.value; setPoForm({ ...poForm, items }); }}
                    options={inventory.map((i: any) => ({ value: i.id, label: i.menuItem.name }))}
                    placeholder="Select item" />
                  <Input type="number" min="1" placeholder="Qty" value={item.quantity}
                    onChange={(e) => { const items = [...poForm.items]; items[idx].quantity = e.target.value; setPoForm({ ...poForm, items }); }} />
                  <div className="flex gap-1">
                    <Input type="number" min="0" step="0.01" placeholder="Unit cost" value={item.unitCost}
                      onChange={(e) => { const items = [...poForm.items]; items[idx].unitCost = e.target.value; setPoForm({ ...poForm, items }); }} />
                    {poForm.items.length > 1 && (
                      <button type="button" onClick={() => setPoForm({ ...poForm, items: poForm.items.filter((_, i) => i !== idx) })}
                        className="px-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              ))}
              <Button size="sm" variant="ghost" icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setPoForm({ ...poForm, items: [...poForm.items, { inventoryItemId: '', quantity: '1', unitCost: '0' }] })}>
                Add Item
              </Button>
            </div>
          </div>

          <div className="bg-[#FFF8F0] rounded-xl border border-[#F5E6D3] p-3 text-sm">
            <div className="flex justify-between font-semibold text-[#4E342E]">
              <span>Estimated Total</span>
              <span>${poForm.items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitCost), 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreatePO(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreatePO} loading={createPO.isPending}
              disabled={!poForm.supplierId || poForm.items.every((i) => !i.inventoryItemId)} className="flex-1">
              Create PO
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Plus, RefreshCw, AlertTriangle,
  Edit, Trash2, Search, TrendingDown,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useInventory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useRestockInventory,
  useAdjustStock,
  useDeleteInventoryItem,
} from '@/hooks/useInventory';
import { useMenuItems } from '@/hooks/useMenu';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { InventoryItemWithMenu } from '@/services/inventory.service';

const CATEGORY_LABELS: Record<string, string> = {
  APPETIZER: 'Appetizer',
  MAIN_COURSE: 'Main Course',
  DESSERT: 'Dessert',
  BEVERAGE: 'Beverage',
  SPECIAL: 'Special',
};

function StockBadge({ quantity, threshold }: { quantity: number; threshold: number }) {
  if (quantity === 0) return <Badge variant="error">Out of Stock</Badge>;
  if (quantity <= threshold) return <Badge variant="warning">Low Stock</Badge>;
  return <Badge variant="success">In Stock</Badge>;
}

export default function InventoryPage() {
  const router = useRouter();
  const user = useCurrentUser();

  // Redirect non-admins
  if (user && !can.manageInventory(user)) {
    router.push('/dashboard');
    return null;
  }

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItemWithMenu | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItemWithMenu | null>(null);
  const [editItem, setEditItem] = useState<InventoryItemWithMenu | null>(null);

  // Form state
  const [createForm, setCreateForm] = useState({
    menuItemId: '',
    quantity: '',
    unit: 'portion',
    lowStockThreshold: '10',
  });
  const [restockQty, setRestockQty] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [editForm, setEditForm] = useState({ unit: '', lowStockThreshold: '' });

  const { data: inventory = [], isLoading } = useInventory();
  const { data: menuData } = useMenuItems({ limit: 200 });
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const restock = useRestockInventory();
  const adjust = useAdjustStock();
  const deleteItem = useDeleteInventoryItem();

  // Menu items not yet tracked
  const trackedMenuItemIds = new Set(inventory.map((i) => i.menuItemId));
  const untrackedMenuItems = (menuData?.data ?? []).filter(
    (m) => !trackedMenuItemIds.has(m.id),
  );

  // Filter inventory
  const filtered = inventory.filter((item) => {
    if (search && !item.menuItem.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus === 'out' && item.quantity !== 0) return false;
    if (filterStatus === 'low' && (item.quantity === 0 || item.quantity > item.lowStockThreshold)) return false;
    return true;
  });

  // Stats
  const totalItems = inventory.length;
  const outOfStock = inventory.filter((i) => i.quantity === 0).length;
  const lowStock = inventory.filter((i) => i.quantity > 0 && i.quantity <= i.lowStockThreshold).length;
  const inStock = inventory.filter((i) => i.quantity > i.lowStockThreshold).length;

  const handleCreate = async () => {
    if (!createForm.menuItemId || !createForm.quantity) return;
    await createItem.mutateAsync({
      menuItemId: createForm.menuItemId,
      quantity: Number(createForm.quantity),
      unit: createForm.unit || 'portion',
      lowStockThreshold: Number(createForm.lowStockThreshold) || 10,
    });
    setCreateForm({ menuItemId: '', quantity: '', unit: 'portion', lowStockThreshold: '10' });
    setShowCreate(false);
  };

  const handleRestock = async () => {
    if (!restockItem || !restockQty) return;
    await restock.mutateAsync({ id: restockItem.id, quantity: Number(restockQty) });
    setRestockQty('');
    setRestockItem(null);
  };

  const handleAdjust = async () => {
    if (!adjustItem || adjustQty === '') return;
    await adjust.mutateAsync({ id: adjustItem.id, quantity: Number(adjustQty) });
    setAdjustQty('');
    setAdjustItem(null);
  };

  const handleEdit = async () => {
    if (!editItem) return;
    await updateItem.mutateAsync({
      id: editItem.id,
      data: {
        unit: editForm.unit || undefined,
        lowStockThreshold: editForm.lowStockThreshold ? Number(editForm.lowStockThreshold) : undefined,
      },
    });
    setEditItem(null);
  };

  return (
    <AppLayout title="Inventory Management">
      <div className="space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4E342E] rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#8D6E63]">Tracked Items</p>
                <p className="text-2xl font-bold text-[#4E342E]">{totalItems}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-[#8D6E63]">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{inStock}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-[#8D6E63]">Low Stock</p>
                <p className="text-2xl font-bold text-orange-500">{lowStock}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-[#8D6E63]">Out of Stock</p>
                <p className="text-2xl font-bold text-red-500">{outOfStock}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Low stock alert banner */}
        {(lowStock > 0 || outOfStock > 0) && (
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-sm text-orange-700">
              <span className="font-semibold">Attention:</span>{' '}
              {outOfStock > 0 && `${outOfStock} item${outOfStock !== 1 ? 's' : ''} out of stock`}
              {outOfStock > 0 && lowStock > 0 && ', '}
              {lowStock > 0 && `${lowStock} item${lowStock !== 1 ? 's' : ''} running low`}
              . Restock soon to keep the menu available.
            </p>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="w-56"
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              options={[
                { value: 'all', label: 'All Items' },
                { value: 'low', label: 'Low Stock' },
                { value: 'out', label: 'Out of Stock' },
              ]}
              className="w-40"
            />
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
            Track Item
          </Button>
        </div>

        {/* Inventory Table */}
        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[#8D6E63]">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">
                {inventory.length === 0
                  ? 'No inventory tracked yet. Click "Track Item" to start.'
                  : 'No items match your filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5E6D3]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[#4E342E]">Menu Item</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#4E342E]">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#4E342E]">Stock</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#4E342E]">Unit</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#4E342E]">Threshold</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#4E342E]">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#4E342E]">Last Restocked</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#4E342E]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#4E342E]">{item.menuItem.name}</p>
                        <p className="text-xs text-[#8D6E63]">${item.menuItem.price.toFixed(2)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">
                          {CATEGORY_LABELS[item.menuItem.category] || item.menuItem.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-lg font-bold ${
                            item.quantity === 0
                              ? 'text-red-500'
                              : item.quantity <= item.lowStockThreshold
                              ? 'text-orange-500'
                              : 'text-green-600'
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8D6E63]">{item.unit}</td>
                      <td className="px-4 py-3 text-[#8D6E63]">{item.lowStockThreshold}</td>
                      <td className="px-4 py-3">
                        <StockBadge quantity={item.quantity} threshold={item.lowStockThreshold} />
                      </td>
                      <td className="px-4 py-3 text-[#8D6E63] text-xs">
                        {item.lastRestockedAt
                          ? new Date(item.lastRestockedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<RefreshCw className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setRestockItem(item);
                              setRestockQty('');
                            }}
                          >
                            Restock
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Edit className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setEditItem(item);
                              setEditForm({
                                unit: item.unit,
                                lowStockThreshold: String(item.lowStockThreshold),
                              });
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setAdjustItem(item);
                              setAdjustQty(String(item.quantity));
                            }}
                            className="text-[#8D6E63] text-xs"
                          >
                            Set
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => {
                              if (confirm(`Remove inventory tracking for "${item.menuItem.name}"?`)) {
                                deleteItem.mutate(item.id);
                              }
                            }}
                          />
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

      {/* ── Create Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Track New Item">
        <div className="space-y-4">
          <Select
            label="Menu Item *"
            value={createForm.menuItemId}
            onChange={(e) => setCreateForm({ ...createForm, menuItemId: e.target.value })}
            options={untrackedMenuItems.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Select a menu item"
          />
          {untrackedMenuItems.length === 0 && (
            <p className="text-xs text-[#8D6E63]">All menu items are already being tracked.</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Initial Stock *"
              type="number"
              min="0"
              value={createForm.quantity}
              onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })}
              placeholder="e.g. 50"
            />
            <Input
              label="Unit"
              value={createForm.unit}
              onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
              placeholder="e.g. portion, kg, litre"
            />
          </div>
          <Input
            label="Low Stock Alert Threshold"
            type="number"
            min="0"
            value={createForm.lowStockThreshold}
            onChange={(e) => setCreateForm({ ...createForm, lowStockThreshold: e.target.value })}
            placeholder="e.g. 10"
          />
          <p className="text-xs text-[#8D6E63]">
            When stock drops to or below this number, the item will be flagged as low stock.
            When it hits 0, the menu item is automatically marked unavailable.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={createItem.isPending}
              disabled={!createForm.menuItemId || !createForm.quantity}
              className="flex-1"
            >
              Start Tracking
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Restock Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!restockItem}
        onClose={() => setRestockItem(null)}
        title={`Restock — ${restockItem?.menuItem.name}`}
      >
        <div className="space-y-4">
          <div className="bg-[#FFF8F0] rounded-xl border border-[#F5E6D3] p-4 flex justify-between">
            <span className="text-[#8D6E63]">Current Stock</span>
            <span className="font-bold text-[#4E342E]">
              {restockItem?.quantity} {restockItem?.unit}
            </span>
          </div>
          <Input
            label="Quantity to Add *"
            type="number"
            min="1"
            value={restockQty}
            onChange={(e) => setRestockQty(e.target.value)}
            placeholder="e.g. 50"
          />
          {restockQty && restockItem && (
            <p className="text-sm text-[#8D6E63]">
              New stock will be:{' '}
              <span className="font-bold text-green-600">
                {restockItem.quantity + Number(restockQty)} {restockItem.unit}
              </span>
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setRestockItem(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleRestock}
              loading={restock.isPending}
              disabled={!restockQty || Number(restockQty) <= 0}
              className="flex-1"
            >
              Restock
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Adjust Stock Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        title={`Set Stock — ${adjustItem?.menuItem.name}`}
      >
        <div className="space-y-4">
          <div className="bg-[#FFF8F0] rounded-xl border border-[#F5E6D3] p-4 flex justify-between">
            <span className="text-[#8D6E63]">Current Stock</span>
            <span className="font-bold text-[#4E342E]">
              {adjustItem?.quantity} {adjustItem?.unit}
            </span>
          </div>
          <Input
            label="Set Stock To *"
            type="number"
            min="0"
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
            placeholder="e.g. 45"
          />
          <p className="text-xs text-[#8D6E63]">
            This sets the stock to an exact value. Use this for manual corrections.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAdjustItem(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAdjust}
              loading={adjust.isPending}
              disabled={adjustQty === ''}
              className="flex-1"
            >
              Set Stock
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Settings Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title={`Edit Settings — ${editItem?.menuItem.name}`}
      >
        <div className="space-y-4">
          <Input
            label="Unit"
            value={editForm.unit}
            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
            placeholder="e.g. portion, kg, litre"
          />
          <Input
            label="Low Stock Threshold"
            type="number"
            min="0"
            value={editForm.lowStockThreshold}
            onChange={(e) => setEditForm({ ...editForm, lowStockThreshold: e.target.value })}
            placeholder="e.g. 10"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditItem(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={updateItem.isPending} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

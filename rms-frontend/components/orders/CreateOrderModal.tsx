'use client';
import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Search, ShoppingCart, UtensilsCrossed, ChevronDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useMenuItems } from '@/hooks/useMenu';
import { useTables } from '@/hooks/useTables';
import { useCreateOrder } from '@/hooks/useOrders';
import { MenuItem, MenuCategory, ModifierGroup, Modifier } from '@/types';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedModifiers {
  [groupId: string]: string[]; // modifier IDs
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
  selectedModifiers: SelectedModifiers;
}

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  APPETIZER: 'Appetizer',
  MAIN_COURSE: 'Main Course',
  DESSERT: 'Dessert',
  BEVERAGE: 'Beverage',
  SPECIAL: 'Special',
};

const CATEGORY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'APPETIZER', label: 'Appetizer' },
  { value: 'MAIN_COURSE', label: 'Main Course' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'BEVERAGE', label: 'Beverage' },
  { value: 'SPECIAL', label: 'Special' },
];

function modifierPrice(item: MenuItem, selected: SelectedModifiers): number {
  if (!item.modifierGroups) return 0;
  return item.modifierGroups.flatMap((g) => g.modifiers).reduce((sum, m) => {
    const isSelected = Object.values(selected).flat().includes(m.id);
    return sum + (isSelected ? m.priceAdjustment : 0);
  }, 0);
}

function ModifierPicker({
  groups,
  selected,
  onChange,
}: {
  groups: ModifierGroup[];
  selected: SelectedModifiers;
  onChange: (updated: SelectedModifiers) => void;
}) {
  if (!groups.length) return null;
  return (
    <div className="mt-2 space-y-2">
      {groups.map((group) => (
        <div key={group.id} className="bg-[#FFF8F0] rounded-lg border border-[#F5E6D3] p-2">
          <p className="text-xs font-semibold text-[#4E342E] mb-1.5">
            {group.name}
            {group.required && <span className="text-red-500 ml-1">*</span>}
            <span className="text-[#8D6E63] font-normal ml-1">({group.multiSelect ? 'multi' : 'pick one'})</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.modifiers.filter((m) => m.available).map((mod) => {
              const isSelected = (selected[group.id] ?? []).includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    const current = selected[group.id] ?? [];
                    let next: string[];
                    if (group.multiSelect) {
                      next = isSelected ? current.filter((id) => id !== mod.id) : [...current, mod.id];
                    } else {
                      next = isSelected ? [] : [mod.id];
                    }
                    onChange({ ...selected, [group.id]: next });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    isSelected
                      ? 'bg-[#FF8A65] text-white border-[#FF8A65]'
                      : 'bg-white text-[#4E342E] border-[#E8D5C4] hover:border-[#FF8A65]'
                  }`}
                >
                  {mod.name}
                  {mod.priceAdjustment !== 0 && (
                    <span className="ml-1 opacity-80">
                      {mod.priceAdjustment > 0 ? `+$${mod.priceAdjustment.toFixed(2)}` : `-$${Math.abs(mod.priceAdjustment).toFixed(2)}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
  const [tableId, setTableId] = useState('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const { data: menuData, isLoading: menuLoading } = useMenuItems({ limit: 200 });
  const { data: tables = [], isLoading: tablesLoading } = useTables();
  const createOrder = useCreateOrder();

  useEffect(() => {
    if (isOpen) {
      setCart([]);
      setTableId('');
      setNotes('');
      setSearch('');
      setCategoryFilter('');
      setExpandedItem(null);
    }
  }, [isOpen]);

  const availableTables = tables.filter((t) => t.status === 'AVAILABLE');
  const allMenuItems = menuData?.data ?? [];
  const filteredItems = allMenuItems.filter((m) => {
    if (!m.available) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && m.category !== categoryFilter) return false;
    return true;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menuItem: item, quantity: 1, notes: '', selectedModifiers: {} }];
    });
    if ((item.modifierGroups?.length ?? 0) > 0) setExpandedItem(item.id);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== id));
  };

  const updateModifiers = (itemId: string, mods: SelectedModifiers) => {
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === itemId ? { ...c, selectedModifiers: mods } : c)),
    );
  };

  const itemTotal = (c: CartItem) =>
    (c.menuItem.price + modifierPrice(c.menuItem, c.selectedModifiers)) * c.quantity;

  const total = cart.reduce((sum, c) => sum + itemTotal(c), 0);
  const canSubmit = tableId !== '' && cart.length > 0 && !createOrder.isPending;

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canSubmit) return;
    try {
      await createOrder.mutateAsync({
        tableId,
        notes: notes.trim() || undefined,
        items: cart.map((c) => ({
          menuItemId: c.menuItem.id,
          quantity: c.quantity,
          notes: c.notes.trim() || undefined,
          modifiers: Object.values(c.selectedModifiers).flat().map((modifierId) => ({ modifierId })),
        })),
      });
      onClose();
    } catch {
      // error toast handled in hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Order" size="xl">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Table *"
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            options={
              tablesLoading
                ? [{ value: '', label: 'Loading tables...' }]
                : availableTables.length === 0
                ? [{ value: '', label: 'No available tables' }]
                : availableTables.map((t) => ({ value: t.id, label: `Table ${t.tableNumber} (${t.capacity} seats)` }))
            }
            placeholder="Select a table"
          />
          <Input
            label="Order Notes"
            placeholder="Special requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Left: Menu Items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#FF8A65]" />
              <h3 className="font-semibold text-[#4E342E]">
                Menu Items
                {allMenuItems.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-[#8D6E63]">({filteredItems.length} shown)</span>
                )}
              </h3>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-[#E8D5C4] bg-white px-3 py-2.5 text-sm text-[#4E342E] focus:outline-none focus:ring-2 focus:ring-[#FF8A65] focus:border-transparent"
              >
                {CATEGORY_FILTERS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="border border-[#F5E6D3] rounded-xl overflow-hidden">
              {menuLoading ? (
                <div className="p-6 text-center text-[#8D6E63] text-sm">
                  <div className="w-6 h-6 border-2 border-[#FF8A65] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading menu...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-6 text-center text-[#8D6E63] text-sm">
                  {allMenuItems.length === 0 ? 'No menu items found.' : 'No items match your search.'}
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-[#F5E6D3]">
                  {filteredItems.map((item) => {
                    const inCart = cart.find((c) => c.menuItem.id === item.id);
                    const hasModifiers = (item.modifierGroups?.length ?? 0) > 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#FFF8F0] transition-colors text-left ${inCart ? 'bg-orange-50' : 'bg-white'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#4E342E] text-sm truncate">{item.name}</p>
                          <p className="text-xs text-[#8D6E63]">
                            {CATEGORY_LABELS[item.category]}
                            {hasModifiers && <span className="ml-1 text-[#FF8A65]">· customisable</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          {item.inventoryItem && (
                            <span className={`text-xs font-medium ${item.inventoryItem.quantity <= item.inventoryItem.lowStockThreshold ? 'text-orange-500' : 'text-green-600'}`}>
                              {item.inventoryItem.quantity} left
                            </span>
                          )}
                          <span className="font-semibold text-[#FF8A65] text-sm">${item.price.toFixed(2)}</span>
                          {inCart ? (
                            <span className="w-5 h-5 bg-[#FF8A65] text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {inCart.quantity}
                            </span>
                          ) : (
                            <Plus className="w-4 h-4 text-[#8D6E63]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#FF8A65]" />
              <h3 className="font-semibold text-[#4E342E]">
                Cart
                {cart.length > 0 && <span className="ml-2 text-xs font-normal text-[#8D6E63]">({cart.length} item{cart.length !== 1 ? 's' : ''})</span>}
              </h3>
            </div>
            <div className="border border-[#F5E6D3] rounded-xl overflow-hidden flex-1">
              {cart.length === 0 ? (
                <div className="p-6 text-center text-[#8D6E63] text-sm h-full flex flex-col items-center justify-center min-h-[120px]">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Click menu items to add them</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-[#F5E6D3]">
                  {cart.map((c) => {
                    const hasModifiers = (c.menuItem.modifierGroups?.length ?? 0) > 0;
                    const isExpanded = expandedItem === c.menuItem.id;
                    return (
                      <div key={c.menuItem.id} className="bg-white">
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#4E342E] truncate">{c.menuItem.name}</p>
                            <p className="text-xs text-[#FF8A65] font-semibold">${itemTotal(c).toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {hasModifiers && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setExpandedItem(isExpanded ? null : c.menuItem.id); }}
                                className="w-6 h-6 rounded-full bg-[#F5E6D3] flex items-center justify-center hover:bg-[#E8D5C4] transition-colors"
                              >
                                <ChevronDown className={`w-3 h-3 text-[#4E342E] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                            <button type="button" onClick={(e) => { e.stopPropagation(); updateQuantity(c.menuItem.id, -1); }} className="w-6 h-6 rounded-full bg-[#F5E6D3] flex items-center justify-center hover:bg-[#E8D5C4] transition-colors">
                              <Minus className="w-3 h-3 text-[#4E342E]" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-[#4E342E]">{c.quantity}</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); updateQuantity(c.menuItem.id, 1); }} className="w-6 h-6 rounded-full bg-[#F5E6D3] flex items-center justify-center hover:bg-[#E8D5C4] transition-colors">
                              <Plus className="w-3 h-3 text-[#4E342E]" />
                            </button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeFromCart(c.menuItem.id); }} className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors ml-1">
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                        {hasModifiers && isExpanded && (
                          <div className="px-3 pb-3">
                            <ModifierPicker
                              groups={c.menuItem.modifierGroups ?? []}
                              selected={c.selectedModifiers}
                              onChange={(mods) => updateModifiers(c.menuItem.id, mods)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="bg-[#FFF8F0] rounded-xl border border-[#F5E6D3] p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-[#4E342E]">Total</span>
                <span className="font-bold text-2xl text-[#FF8A65]">${total.toFixed(2)}</span>
              </div>
              {!tableId && <p className="text-xs text-orange-500 mb-2">⚠ Select a table to continue</p>}
              {cart.length === 0 && <p className="text-xs text-orange-500 mb-2">⚠ Add at least one item</p>}
              <Button type="button" className="w-full" onClick={handleSubmit} loading={createOrder.isPending} disabled={!canSubmit}>
                {createOrder.isPending ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

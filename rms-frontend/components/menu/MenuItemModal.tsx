'use client';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ModifierManager } from './ModifierManager';
import { useCreateMenuItem, useUpdateMenuItem } from '@/hooks/useMenu';
import { MenuItem, MenuCategory } from '@/types';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: MenuItem | null;
}

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'APPETIZER', label: 'Appetizer' },
  { value: 'MAIN_COURSE', label: 'Main Course' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'BEVERAGE', label: 'Beverage' },
  { value: 'SPECIAL', label: 'Special' },
];

type Tab = 'details' | 'modifiers';

export function MenuItemModal({ isOpen, onClose, editItem }: MenuItemModalProps) {
  const [tab, setTab] = useState<Tab>('details');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'MAIN_COURSE' as MenuCategory,
    available: true,
    imageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        description: editItem.description || '',
        price: String(editItem.price),
        category: editItem.category,
        available: editItem.available,
        imageUrl: editItem.imageUrl || '',
      });
    } else {
      setForm({ name: '', description: '', price: '', category: 'MAIN_COURSE', available: true, imageUrl: '' });
    }
    setErrors({});
    setTab('details');
  }, [editItem, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = 'Valid price required';
    if (!form.category) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      category: form.category,
      available: form.available,
      imageUrl: form.imageUrl.trim() || undefined,
    };
    if (editItem) {
      await updateItem.mutateAsync({ id: editItem.id, data: payload });
    } else {
      await createItem.mutateAsync(payload);
    }
    onClose();
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Edit Menu Item' : 'Add Menu Item'} size="lg">
      {/* Tabs — only show modifiers tab when editing */}
      {editItem && (
        <div className="flex gap-1 mb-5 bg-[#F5E6D3] rounded-xl p-1">
          {(['details', 'modifiers'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? 'bg-white text-[#4E342E] shadow-sm' : 'text-[#8D6E63] hover:text-[#4E342E]'
              }`}
            >
              {t === 'modifiers' ? 'Modifiers' : 'Details'}
            </button>
          ))}
        </div>
      )}

      {tab === 'details' && (
        <div className="space-y-4">
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            placeholder="e.g. Grilled Salmon"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price *"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              error={errors.price}
              placeholder="0.00"
            />
            <Select
              label="Category *"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as MenuCategory })}
              options={CATEGORIES}
              error={errors.category}
            />
          </div>
          <Input
            label="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://..."
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
              className="w-4 h-4 accent-[#FF8A65]"
            />
            <label htmlFor="available" className="text-sm font-medium text-[#4E342E]">
              Available for ordering
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} loading={isPending} className="flex-1">
              {editItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </div>
      )}

      {tab === 'modifiers' && editItem && (
        <ModifierManager menuItemId={editItem.id} menuItemName={editItem.name} />
      )}
    </Modal>
  );
}

'use client';
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ModifierGroup } from '@/types';
import {
  useModifierGroups,
  useCreateModifierGroup,
  useDeleteModifierGroup,
  useAddModifier,
  useDeleteModifier,
} from '@/hooks/useModifiers';

interface ModifierManagerProps {
  menuItemId: string;
  menuItemName: string;
}

export function ModifierManager({ menuItemId, menuItemName }: ModifierManagerProps) {
  const { data: groups = [], isLoading } = useModifierGroups(menuItemId);
  const createGroup = useCreateModifierGroup(menuItemId);
  const deleteGroup = useDeleteModifierGroup(menuItemId);
  const addModifier = useAddModifier(menuItemId);
  const deleteModifier = useDeleteModifier(menuItemId);

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupRequired, setNewGroupRequired] = useState(false);
  const [newGroupMulti, setNewGroupMulti] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [newModifier, setNewModifier] = useState<Record<string, { name: string; price: string }>>({});

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    await createGroup.mutateAsync({
      name: newGroupName.trim(),
      required: newGroupRequired,
      multiSelect: newGroupMulti,
    });
    setNewGroupName('');
    setNewGroupRequired(false);
    setNewGroupMulti(false);
    setShowNewGroup(false);
  };

  const handleAddModifier = async (groupId: string) => {
    const m = newModifier[groupId];
    if (!m?.name?.trim()) return;
    await addModifier.mutateAsync({
      groupId,
      data: { name: m.name.trim(), priceAdjustment: Number(m.price) || 0 },
    });
    setNewModifier((prev) => ({ ...prev, [groupId]: { name: '', price: '' } }));
  };

  if (isLoading) return <p className="text-sm text-[#8D6E63]">Loading modifiers…</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#4E342E]">Modifier Groups</p>
        <Button size="sm" variant="ghost" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowNewGroup((s) => !s)}>
          Add Group
        </Button>
      </div>

      {/* New group form */}
      {showNewGroup && (
        <div className="bg-[#FFF8F0] rounded-xl border border-[#F5E6D3] p-3 space-y-2">
          <Input
            placeholder="Group name (e.g. Size, Extras)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newGroupRequired} onChange={(e) => setNewGroupRequired(e.target.checked)} className="accent-[#FF8A65]" />
              Required
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newGroupMulti} onChange={(e) => setNewGroupMulti(e.target.checked)} className="accent-[#FF8A65]" />
              Multi-select
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowNewGroup(false)} className="flex-1">Cancel</Button>
            <Button size="sm" onClick={handleCreateGroup} loading={createGroup.isPending} disabled={!newGroupName.trim()} className="flex-1">
              Create
            </Button>
          </div>
        </div>
      )}

      {groups.length === 0 && !showNewGroup && (
        <p className="text-xs text-[#8D6E63] text-center py-3">No modifier groups yet.</p>
      )}

      {/* Existing groups */}
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group.id);
        const mod = newModifier[group.id] ?? { name: '', price: '' };
        return (
          <div key={group.id} className="border border-[#E8D5C4] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-[#F5E6D3] hover:bg-[#EDD5C0] transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#4E342E]">
                {group.name}
                <span className="text-xs font-normal text-[#8D6E63]">
                  {group.required ? '· Required' : '· Optional'}
                  {group.multiSelect ? ' · Multi' : ' · Single'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8D6E63]">{group.modifiers.length} option{group.modifiers.length !== 1 ? 's' : ''}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete group "${group.name}" and all its modifiers?`)) {
                      deleteGroup.mutate(group.id);
                    }
                  }}
                  className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-[#8D6E63]" /> : <ChevronDown className="w-4 h-4 text-[#8D6E63]" />}
              </div>
            </button>

            {isExpanded && (
              <div className="p-3 space-y-2">
                {group.modifiers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#F5E6D3]">
                    <span className="text-sm text-[#4E342E]">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#FF8A65]">
                        {m.priceAdjustment > 0 ? `+$${m.priceAdjustment.toFixed(2)}` : m.priceAdjustment < 0 ? `-$${Math.abs(m.priceAdjustment).toFixed(2)}` : 'Free'}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteModifier.mutate({ groupId: group.id, modifierId: m.id })}
                        className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add modifier inline */}
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Option name"
                    value={mod.name}
                    onChange={(e) => setNewModifier((prev) => ({ ...prev, [group.id]: { ...mod, name: e.target.value } }))}
                    className="flex-1"
                  />
                  <Input
                    placeholder="+price"
                    type="number"
                    step="0.01"
                    value={mod.price}
                    onChange={(e) => setNewModifier((prev) => ({ ...prev, [group.id]: { ...mod, price: e.target.value } }))}
                    className="w-24"
                  />
                  <Button
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => handleAddModifier(group.id)}
                    disabled={!mod.name.trim()}
                    loading={addModifier.isPending}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

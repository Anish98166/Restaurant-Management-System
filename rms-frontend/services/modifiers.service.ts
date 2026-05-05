import api from '@/lib/axios';
import { ModifierGroup, Modifier } from '@/types';

export interface CreateModifierGroupData {
  name: string;
  required?: boolean;
  multiSelect?: boolean;
  modifiers?: Array<{ name: string; priceAdjustment?: number }>;
}

export interface CreateModifierData {
  name: string;
  priceAdjustment?: number;
  available?: boolean;
}

export const modifiersService = {
  getGroups: async (menuItemId: string): Promise<ModifierGroup[]> => {
    const { data } = await api.get<ModifierGroup[]>(`/menu/${menuItemId}/modifiers`);
    return data;
  },

  createGroup: async (menuItemId: string, payload: CreateModifierGroupData): Promise<ModifierGroup> => {
    const { data } = await api.post<ModifierGroup>(`/menu/${menuItemId}/modifiers/groups`, payload);
    return data;
  },

  updateGroup: async (menuItemId: string, groupId: string, payload: Partial<CreateModifierGroupData>): Promise<ModifierGroup> => {
    const { data } = await api.put<ModifierGroup>(`/menu/${menuItemId}/modifiers/groups/${groupId}`, payload);
    return data;
  },

  deleteGroup: async (menuItemId: string, groupId: string): Promise<void> => {
    await api.delete(`/menu/${menuItemId}/modifiers/groups/${groupId}`);
  },

  addModifier: async (menuItemId: string, groupId: string, payload: CreateModifierData): Promise<Modifier> => {
    const { data } = await api.post<Modifier>(`/menu/${menuItemId}/modifiers/groups/${groupId}/modifiers`, payload);
    return data;
  },

  updateModifier: async (menuItemId: string, groupId: string, modifierId: string, payload: Partial<CreateModifierData>): Promise<Modifier> => {
    const { data } = await api.put<Modifier>(`/menu/${menuItemId}/modifiers/groups/${groupId}/modifiers/${modifierId}`, payload);
    return data;
  },

  deleteModifier: async (menuItemId: string, groupId: string, modifierId: string): Promise<void> => {
    await api.delete(`/menu/${menuItemId}/modifiers/groups/${groupId}/modifiers/${modifierId}`);
  },
};

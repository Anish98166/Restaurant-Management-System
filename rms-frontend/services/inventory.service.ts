import api from '@/lib/axios';
import { InventoryItem } from '@/types';

export interface CreateInventoryData {
  menuItemId: string;
  quantity: number;
  unit?: string;
  lowStockThreshold?: number;
}

export interface UpdateInventoryData {
  unit?: string;
  lowStockThreshold?: number;
}

export interface InventoryItemWithMenu extends InventoryItem {
  menuItem: {
    id: string;
    name: string;
    category: string;
    price: number;
    available: boolean;
  };
}

export const inventoryService = {
  getAll: async (): Promise<InventoryItemWithMenu[]> => {
    const { data } = await api.get<InventoryItemWithMenu[]>('/inventory');
    return data;
  },

  getLowStock: async (): Promise<InventoryItemWithMenu[]> => {
    const { data } = await api.get<InventoryItemWithMenu[]>('/inventory/low-stock');
    return data;
  },

  getOne: async (id: string): Promise<InventoryItemWithMenu> => {
    const { data } = await api.get<InventoryItemWithMenu>(`/inventory/${id}`);
    return data;
  },

  create: async (payload: CreateInventoryData): Promise<InventoryItemWithMenu> => {
    const { data } = await api.post<InventoryItemWithMenu>('/inventory', payload);
    return data;
  },

  update: async (id: string, payload: UpdateInventoryData): Promise<InventoryItemWithMenu> => {
    const { data } = await api.put<InventoryItemWithMenu>(`/inventory/${id}`, payload);
    return data;
  },

  restock: async (id: string, quantity: number): Promise<InventoryItemWithMenu> => {
    const { data } = await api.patch<InventoryItemWithMenu>(`/inventory/${id}/restock`, { quantity });
    return data;
  },

  adjust: async (id: string, quantity: number): Promise<InventoryItemWithMenu> => {
    const { data } = await api.patch<InventoryItemWithMenu>(`/inventory/${id}/adjust`, { quantity });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },
};

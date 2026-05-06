import api from '@/lib/axios';
import { Supplier, PurchaseOrder, PurchaseOrderStatus } from '@/types';

export interface CreateSupplierData {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface CreatePurchaseOrderData {
  supplierId: string;
  notes?: string;
  items: Array<{ inventoryItemId: string; quantity: number; unitCost?: number }>;
}

export const suppliersService = {
  getAll: async (): Promise<Supplier[]> => {
    const { data } = await api.get<Supplier[]>('/suppliers');
    return data;
  },

  getOne: async (id: string): Promise<Supplier> => {
    const { data } = await api.get<Supplier>(`/suppliers/${id}`);
    return data;
  },

  create: async (payload: CreateSupplierData): Promise<Supplier> => {
    const { data } = await api.post<Supplier>('/suppliers', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateSupplierData> & { active?: boolean }): Promise<Supplier> => {
    const { data } = await api.put<Supplier>(`/suppliers/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },

  linkItem: async (supplierId: string, inventoryItemId: string, unitCost?: number): Promise<void> => {
    await api.post(`/suppliers/${supplierId}/items`, { inventoryItemId, unitCost });
  },

  unlinkItem: async (supplierId: string, inventoryItemId: string): Promise<void> => {
    await api.delete(`/suppliers/${supplierId}/items/${inventoryItemId}`);
  },

  getAllPOs: async (): Promise<PurchaseOrder[]> => {
    const { data } = await api.get<PurchaseOrder[]>('/suppliers/purchase-orders/all');
    return data;
  },

  getOnePO: async (id: string): Promise<PurchaseOrder> => {
    const { data } = await api.get<PurchaseOrder>(`/suppliers/purchase-orders/${id}`);
    return data;
  },

  createPO: async (payload: CreatePurchaseOrderData): Promise<PurchaseOrder> => {
    const { data } = await api.post<PurchaseOrder>('/suppliers/purchase-orders', payload);
    return data;
  },

  updatePOStatus: async (id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> => {
    const { data } = await api.patch<PurchaseOrder>(`/suppliers/purchase-orders/${id}/status`, { status });
    return data;
  },

  receivePO: async (id: string, items?: Array<{ purchaseOrderItemId: string; received: number }>): Promise<PurchaseOrder> => {
    const { data } = await api.post<PurchaseOrder>(`/suppliers/purchase-orders/${id}/receive`, { items });
    return data;
  },

  deletePO: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/purchase-orders/${id}`);
  },
};

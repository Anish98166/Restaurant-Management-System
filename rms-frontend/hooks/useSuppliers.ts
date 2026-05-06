'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { suppliersService, CreateSupplierData, CreatePurchaseOrderData } from '@/services/suppliers.service';
import { PurchaseOrderStatus } from '@/types';

export const SUPPLIER_KEYS = {
  all: ['suppliers'] as const,
  list: () => [...SUPPLIER_KEYS.all, 'list'] as const,
  detail: (id: string) => [...SUPPLIER_KEYS.all, 'detail', id] as const,
  pos: () => [...SUPPLIER_KEYS.all, 'purchase-orders'] as const,
  po: (id: string) => [...SUPPLIER_KEYS.all, 'po', id] as const,
};

export function useSuppliers() {
  return useQuery({ queryKey: SUPPLIER_KEYS.list(), queryFn: suppliersService.getAll });
}

export function useSupplier(id: string) {
  return useQuery({ queryKey: SUPPLIER_KEYS.detail(id), queryFn: () => suppliersService.getOne(id), enabled: !!id });
}

export function usePurchaseOrders() {
  return useQuery({ queryKey: SUPPLIER_KEYS.pos(), queryFn: suppliersService.getAllPOs });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierData) => suppliersService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SUPPLIER_KEYS.list() }); toast.success('Supplier created'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create supplier'),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => suppliersService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SUPPLIER_KEYS.list() }); toast.success('Supplier updated'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update supplier'),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SUPPLIER_KEYS.list() }); toast.success('Supplier deleted'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete supplier'),
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePurchaseOrderData) => suppliersService.createPO(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SUPPLIER_KEYS.pos() }); toast.success('Purchase order created'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create PO'),
  });
}

export function useUpdatePOStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PurchaseOrderStatus }) => suppliersService.updatePOStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SUPPLIER_KEYS.pos() }); toast.success('Status updated'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update status'),
  });
}

export function useReceivePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items?: any[] }) => suppliersService.receivePO(id, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUPPLIER_KEYS.pos() });
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Purchase order received — inventory restocked');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to receive PO'),
  });
}

export function useDeletePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersService.deletePO(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SUPPLIER_KEYS.pos() }); toast.success('Purchase order deleted'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete PO'),
  });
}

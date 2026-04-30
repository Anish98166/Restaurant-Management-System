'use client';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Trash2 } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useUpdateOrderStatus, useDeleteOrder } from '@/hooks/useOrders';
import { format } from 'date-fns';

interface OrdersTableProps {
  orders: Order[];
  onViewOrder?: (order: Order) => void;
  canDelete?: boolean;
  canCancel?: boolean;
}

// Staff can advance: PENDING→PREPARING→SERVED→COMPLETED
// Admin can also cancel from any active state
const STAFF_STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  PENDING: 'PREPARING',
  PREPARING: 'SERVED',
  SERVED: 'COMPLETED',
  COMPLETED: null,
  CANCELLED: null,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  SERVED: 'Served',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function OrdersTable({ orders, onViewOrder, canDelete = false, canCancel = false }: OrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: '#',
        cell: ({ getValue }) => (
          <span className="font-mono font-semibold text-[#4E342E]">#{getValue<number>()}</span>
        ),
      },
      {
        accessorFn: (row) => row.table?.tableNumber,
        id: 'table',
        header: 'Table',
        cell: ({ getValue }) => (
          <span className="font-medium">Table {getValue<number>()}</span>
        ),
      },
      {
        accessorFn: (row) => row.staff?.name,
        id: 'staff',
        header: 'Staff',
        cell: ({ getValue }) => <span className="text-[#8D6E63]">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <OrderStatusBadge status={getValue<OrderStatus>()} />,
        filterFn: (row, id, value) => value === '' || row.getValue(id) === value,
      },
      {
        accessorFn: (row) => row.items.length,
        id: 'items',
        header: 'Items',
        cell: ({ getValue }) => <span>{getValue<number>()} item(s)</span>,
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: ({ getValue }) => (
          <span className="font-semibold text-[#4E342E]">${getValue<number>().toFixed(2)}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Time',
        cell: ({ getValue }) => (
          <span className="text-[#8D6E63] text-sm">
            {format(new Date(getValue<string>()), 'HH:mm')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const order = row.original;
          const nextStatus = STAFF_STATUS_FLOW[order.status];
          const isActive = ['PENDING', 'PREPARING', 'SERVED'].includes(order.status);

          return (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Advance status button — available to all staff */}
              {nextStatus && (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
                >
                  → {STATUS_LABELS[nextStatus]}
                </Button>
              )}

              {/* Cancel — admin only */}
              {canCancel && isActive && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-orange-600 hover:bg-orange-50"
                  loading={updateStatus.isPending}
                  onClick={() => {
                    if (confirm(`Cancel order #${order.orderNumber}?`)) {
                      updateStatus.mutate({ id: order.id, status: 'CANCELLED' });
                    }
                  }}
                >
                  Cancel
                </Button>
              )}

              {/* Delete — admin only */}
              {canDelete && (
                <Button
                  size="sm"
                  variant="danger"
                  icon={<Trash2 className="w-3 h-3" />}
                  loading={deleteOrder.isPending}
                  onClick={() => {
                    if (confirm(`Permanently delete order #${order.orderNumber}?`)) {
                      deleteOrder.mutate(order.id);
                    }
                  }}
                >
                  Delete
                </Button>
              )}

              {onViewOrder && (
                <Button size="sm" variant="ghost" onClick={() => onViewOrder(order)}>
                  View
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [updateStatus, deleteOrder, onViewOrder, canDelete, canCancel],
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-[#F5E6D3]">
        <table className="w-full text-sm">
          <thead className="bg-[#F5E6D3]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold text-[#4E342E] whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-[#8D6E63]">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[#8D6E63]">
                  No orders found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-[#8D6E63]">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

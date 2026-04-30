'use client';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  flexRender, ColumnDef, SortingState,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { MenuItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDeleteMenuItem, useToggleMenuItemAvailability } from '@/hooks/useMenu';

interface MenuTableProps {
  items: MenuItem[];
  onEdit?: (item: MenuItem) => void;
  isAdmin?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  APPETIZER: 'Appetizer',
  MAIN_COURSE: 'Main Course',
  DESSERT: 'Dessert',
  BEVERAGE: 'Beverage',
  SPECIAL: 'Special',
};

export function MenuTable({ items, onEdit, isAdmin }: MenuTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const deleteItem = useDeleteMenuItem();
  const toggleAvailability = useToggleMenuItemAvailability();

  const columns = useMemo<ColumnDef<MenuItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue, row }) => (
          <div>
            <p className="font-medium text-[#4E342E]">{getValue<string>()}</p>
            {row.original.description && (
              <p className="text-xs text-[#8D6E63] truncate max-w-xs">{row.original.description}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => (
          <Badge variant="default">{CATEGORY_LABELS[getValue<string>()] || getValue<string>()}</Badge>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ getValue }) => (
          <span className="font-semibold text-[#4E342E]">${getValue<number>().toFixed(2)}</span>
        ),
      },
      {
        accessorKey: 'available',
        header: 'Available',
        cell: ({ getValue, row }) => (
          <button
            onClick={() => isAdmin && toggleAvailability.mutate(row.original.id)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              getValue<boolean>() ? 'text-green-600' : 'text-red-500'
            } ${isAdmin ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'}`}
          >
            {getValue<boolean>() ? (
              <><ToggleRight className="w-5 h-5" /> Yes</>
            ) : (
              <><ToggleLeft className="w-5 h-5" /> No</>
            )}
          </button>
        ),
      },
      ...(isAdmin
        ? [
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }: { row: { original: MenuItem } }) => (
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button size="sm" variant="ghost" icon={<Edit className="w-4 h-4" />} onClick={() => onEdit(row.original)}>
                      Edit
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    icon={<Trash2 className="w-4 h-4" />}
                    loading={deleteItem.isPending}
                    onClick={() => {
                      if (confirm('Delete this menu item?')) deleteItem.mutate(row.original.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ),
            } as ColumnDef<MenuItem>,
          ]
        : []),
    ],
    [deleteItem, toggleAvailability, onEdit, isAdmin],
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
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
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
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
                  No menu items found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors">
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
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-[#8D6E63]">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

import { OrderStatus, TableStatus, PaymentStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-amber-100 text-amber-800 border border-amber-300',
    success: 'bg-green-100 text-green-800 border border-green-300',
    warning: 'bg-orange-100 text-orange-800 border border-orange-300',
    error: 'bg-red-100 text-red-800 border border-red-300',
    info: 'bg-blue-100 text-blue-800 border border-blue-300',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { label: string; className: string }> = {
    PENDING: { label: 'Pending', className: 'badge-pending' },
    PREPARING: { label: 'Preparing', className: 'badge-preparing' },
    SERVED: { label: 'Served', className: 'badge-served' },
    COMPLETED: { label: 'Completed', className: 'badge-completed' },
    CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  };
  const { label, className } = config[status] || config.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function TableStatusBadge({ status }: { status: TableStatus }) {
  const config: Record<TableStatus, { label: string; className: string }> = {
    AVAILABLE: { label: 'Available', className: 'badge-available' },
    OCCUPIED: { label: 'Occupied', className: 'badge-occupied' },
    RESERVED: { label: 'Reserved', className: 'badge-reserved' },
    CLEANING: { label: 'Cleaning', className: 'badge-cleaning' },
  };
  const { label, className } = config[status] || config.AVAILABLE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { label: string; variant: BadgeProps['variant'] }> = {
    PENDING: { label: 'Pending', variant: 'warning' },
    PAID: { label: 'Paid', variant: 'success' },
    REFUNDED: { label: 'Refunded', variant: 'info' },
  };
  const { label, variant } = config[status] || config.PENDING;
  return <Badge variant={variant}>{label}</Badge>;
}

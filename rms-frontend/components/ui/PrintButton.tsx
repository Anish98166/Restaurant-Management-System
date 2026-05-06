'use client';
import { useState } from 'react';
import { Printer } from 'lucide-react';
import { printService } from '@/services/print.service';
import toast from 'react-hot-toast';

interface PrintButtonProps {
  type: 'order' | 'receipt';
  id: string;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export function PrintButton({ type, id, size = 'sm', label, className = '' }: PrintButtonProps) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      if (type === 'order') {
        await printService.printOrderTicket(id);
      } else {
        await printService.printReceiptTicket(id);
      }
    } catch {
      toast.error('Failed to open print window');
    } finally {
      setPrinting(false);
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={printing}
      className={`inline-flex items-center gap-1.5 font-medium rounded-xl border border-[#E8D5C4] bg-white text-[#4E342E] hover:bg-[#FFF8F0] hover:border-[#FF8A65] transition-colors disabled:opacity-50 ${sizeClasses} ${className}`}
      title={type === 'order' ? 'Print kitchen ticket' : 'Print receipt'}
    >
      <Printer className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {label ?? (type === 'order' ? 'Print Ticket' : 'Print Receipt')}
    </button>
  );
}

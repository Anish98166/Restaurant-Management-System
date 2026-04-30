'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useCreatePayment } from '@/hooks/usePayments';
import { Order, PaymentMethod } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const PAYMENT_METHODS: Array<{ value: string; label: string }> = [
  { value: 'CASH', label: '💵 Cash' },
  { value: 'CARD', label: '💳 Card' },
  { value: 'ONLINE', label: '📱 Online' },
];

export function PaymentModal({ isOpen, onClose, order }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const createPayment = useCreatePayment();

  if (!order) return null;

  const handleSubmit = async () => {
    await createPayment.mutateAsync({ orderId: order.id, method });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Payment">
      <div className="space-y-4">
        <div className="bg-[#FFF8F0] rounded-xl p-4 border border-[#F5E6D3]">
          <div className="flex justify-between mb-2">
            <span className="text-[#8D6E63]">Order</span>
            <span className="font-semibold text-[#4E342E]">#{order.orderNumber}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[#8D6E63]">Table</span>
            <span className="font-semibold text-[#4E342E]">Table {order.table?.tableNumber}</span>
          </div>
          <div className="border-t border-[#F5E6D3] pt-2 mt-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span className="text-[#4E342E]">{item.menuItem.name} × {item.quantity}</span>
                <span className="text-[#8D6E63]">${(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#F5E6D3] pt-2 mt-2 flex justify-between">
            <span className="font-bold text-[#4E342E]">Total</span>
            <span className="font-bold text-xl text-[#FF8A65]">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <Select
          label="Payment Method"
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          options={PAYMENT_METHODS}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={createPayment.isPending} className="flex-1">
            Confirm Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
}

'use client';
import { useState, useEffect, use, useRef } from 'react';
import { CheckCircle, Printer, ChefHat } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { format } from 'date-fns';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ReceiptData {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  order: {
    orderNumber: number;
    notes?: string;
    totalAmount: number;
    createdAt: string;
    table: { tableNumber: number };
    staff: { name: string };
    items: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      menuItem: { name: string; category: string };
      modifiers: Array<{ name: string; priceAdjustment: number }>;
    }>;
  };
}

export default function ReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = use(params);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`${API_BASE}/public/receipt/${paymentId}`)
      .then((r) => setReceipt(r.data))
      .catch(() => setError('Receipt not found.'))
      .finally(() => setLoading(false));
  }, [paymentId]);

  const handlePrint = () => window.print();

  const receiptUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF8A65] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6">
        <div className="text-center text-[#8D6E63]">
          <p className="text-lg font-semibold">{error || 'Receipt not found'}</p>
        </div>
      </div>
    );
  }

  const subtotal = receipt.order.items.reduce((s, i) => {
    const modTotal = i.modifiers.reduce((ms, m) => ms + m.priceAdjustment, 0);
    return s + (i.unitPrice + modTotal) * i.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 print:bg-white print:p-0">
      <div ref={printRef} className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 print:shadow-none print:rounded-none print:max-w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#FF8A65] rounded-xl flex items-center justify-center mx-auto mb-3">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#4E342E]">Bistro RMS</h1>
          <p className="text-sm text-[#8D6E63]">Official Receipt</p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="font-semibold text-green-600">Payment Confirmed</span>
        </div>

        {/* Order info */}
        <div className="bg-[#FFF8F0] rounded-xl border border-[#F5E6D3] p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#8D6E63]">Order #</span>
            <span className="font-bold text-[#4E342E]">#{receipt.order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8D6E63]">Table</span>
            <span className="text-[#4E342E]">Table {receipt.order.table.tableNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8D6E63]">Served by</span>
            <span className="text-[#4E342E]">{receipt.order.staff.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8D6E63]">Date</span>
            <span className="text-[#4E342E]">{format(new Date(receipt.createdAt), 'MMM d, yyyy HH:mm')}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-dashed border-[#E8D5C4] pt-4 mb-4 space-y-3">
          {receipt.order.items.map((item) => {
            const modTotal = item.modifiers.reduce((s, m) => s + m.priceAdjustment, 0);
            const lineTotal = (item.unitPrice + modTotal) * item.quantity;
            return (
              <div key={item.id}>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4E342E] font-medium">
                    {item.quantity}× {item.menuItem.name}
                  </span>
                  <span className="text-[#4E342E] font-medium">${lineTotal.toFixed(2)}</span>
                </div>
                {item.modifiers.length > 0 && (
                  <p className="text-xs text-[#8D6E63] ml-4">
                    + {item.modifiers.map((m) => m.name).join(', ')}
                  </p>
                )}
                {item.notes && (
                  <p className="text-xs text-[#8D6E63] ml-4 italic">"{item.notes}"</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t border-[#F5E6D3] pt-3 space-y-1.5 text-sm mb-4">
          <div className="flex justify-between text-[#8D6E63]">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#4E342E] text-base pt-1 border-t border-[#F5E6D3]">
            <span>Total Paid</span>
            <span className="text-[#FF8A65]">${receipt.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#8D6E63]">
            <span>Payment Method</span>
            <span className="capitalize">{receipt.method.toLowerCase()}</span>
          </div>
        </div>

        {/* QR code for this receipt */}
        <div className="flex flex-col items-center gap-2 border-t border-dashed border-[#E8D5C4] pt-4 mb-4">
          <QRCodeSVG value={receiptUrl} size={80} bgColor="#ffffff" fgColor="#4E342E" level="M" />
          <p className="text-xs text-[#BCAAA4] text-center">Scan to view this receipt</p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#BCAAA4]">Thank you for dining with us! 🍽️</p>

        {/* Print button — hidden in print */}
        <div className="mt-5 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 bg-[#4E342E] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#3E2723] transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RestaurantTable } from '@/types';

interface QRCodeModalProps {
  table: RestaurantTable | null;
  onClose: () => void;
}

export function QRCodeModal({ table, onClose }: QRCodeModalProps) {
  const svgRef = useRef<HTMLDivElement>(null);

  if (!table) return null;

  const menuUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/menu/${table.id}`
      : `/menu/${table.id}`;

  const handleDownload = () => {
    const svgEl = svgRef.current?.querySelector('svg');
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `table-${table.tableNumber}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={!!table} onClose={onClose} title={`Table ${table.tableNumber} — QR Code`}>
      <div className="flex flex-col items-center gap-5">
        {/* QR Code */}
        <div
          ref={svgRef}
          className="p-4 bg-white rounded-2xl border-2 border-[#F5E6D3] shadow-sm"
        >
          <QRCodeSVG
            value={menuUrl}
            size={220}
            bgColor="#ffffff"
            fgColor="#4E342E"
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Info */}
        <div className="text-center space-y-1">
          <p className="font-semibold text-[#4E342E]">Table {table.tableNumber}</p>
          <p className="text-sm text-[#8D6E63]">{table.capacity} seats</p>
          <p className="text-xs text-[#8D6E63] break-all max-w-xs">{menuUrl}</p>
        </div>

        {/* Instructions */}
        <div className="w-full bg-[#FFF8F0] rounded-xl border border-[#F5E6D3] p-4 text-sm text-[#8D6E63] space-y-1">
          <p className="font-medium text-[#4E342E] mb-2">How it works</p>
          <p>1. Print or display this QR code at the table</p>
          <p>2. Customers scan it with their phone camera</p>
          <p>3. They browse the menu and place their order</p>
          <p>4. The order appears instantly in your orders list</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button
            variant="ghost"
            className="flex-1"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
          >
            Download SVG
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={() => window.open(menuUrl, '_blank')}
          >
            Preview
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

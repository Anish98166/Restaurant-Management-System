import api from '@/lib/axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const printService = {
  /** Open a printable kitchen ticket in a new window */
  printOrderTicket: async (orderId: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rms_token') : '';
    const res = await fetch(`${API_BASE}/print/order/${orderId}/html`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const html = await res.text();
    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 500);
    }
  },

  /** Open a printable receipt in a new window */
  printReceiptTicket: async (paymentId: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rms_token') : '';
    const res = await fetch(`${API_BASE}/print/receipt/${paymentId}/html`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const html = await res.text();
    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 500);
    }
  },

  /** Get raw ESC/POS text for order (for network printer integration) */
  getOrderText: async (orderId: string): Promise<string> => {
    const { data } = await api.get<{ text: string }>(`/print/order/${orderId}`);
    return data.text;
  },

  /** Get raw ESC/POS text for receipt */
  getReceiptText: async (paymentId: string): Promise<string> => {
    const { data } = await api.get<{ text: string }>(`/print/receipt/${paymentId}`);
    return data.text;
  },
};

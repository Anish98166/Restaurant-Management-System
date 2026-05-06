import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrintService {
  constructor(private prisma: PrismaService) {}

  private orderInclude = {
    table: { select: { tableNumber: true } },
    staff: { select: { name: true } },
    items: {
      include: {
        menuItem: { select: { name: true, category: true } },
        modifiers: { select: { name: true, priceAdjustment: true } },
      },
    },
  };

  async getOrderTicket(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: this.orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');
    return { order, text: this.formatKitchenTicket(order), html: this.formatKitchenTicketHtml(order) };
  }

  async getReceiptTicket(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            table: { select: { tableNumber: true } },
            staff: { select: { name: true } },
            items: {
              include: {
                menuItem: { select: { name: true } },
                modifiers: { select: { name: true, priceAdjustment: true } },
              },
            },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return { payment, text: this.formatReceiptText(payment), html: this.formatReceiptHtml(payment) };
  }

  // ── Plain text formatters (ESC/POS compatible) ────────────────────────────

  private formatKitchenTicket(order: any): string {
    const line = '--------------------------------';
    const now = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const lines: string[] = [
      '*** KITCHEN TICKET ***',
      line,
      `Order #${order.orderNumber}   Table ${order.table?.tableNumber ?? '?'}`,
      `Time: ${now}`,
      `Staff: ${order.staff?.name ?? '?'}`,
      line,
    ];

    for (const item of order.items) {
      lines.push(`${item.quantity}x  ${item.menuItem.name}`);
      for (const mod of item.modifiers ?? []) {
        lines.push(`     + ${mod.name}`);
      }
      if (item.notes) lines.push(`     * ${item.notes}`);
    }

    lines.push(line);
    if (order.notes) {
      lines.push(`NOTE: ${order.notes}`);
      lines.push(line);
    }

    return lines.join('\n');
  }

  private formatReceiptText(payment: any): string {
    const order = payment.order;
    const line = '--------------------------------';
    const now = new Date(payment.createdAt).toLocaleString();
    const lines: string[] = [
      '        BISTRO RMS',
      '      Official Receipt',
      line,
      `Order #${order.orderNumber}   Table ${order.table?.tableNumber ?? '?'}`,
      `Date: ${now}`,
      `Staff: ${order.staff?.name ?? '?'}`,
      line,
    ];

    let subtotal = 0;
    for (const item of order.items) {
      const modTotal = (item.modifiers ?? []).reduce((s: number, m: any) => s + m.priceAdjustment, 0);
      const lineTotal = (item.unitPrice + modTotal) * item.quantity;
      subtotal += lineTotal;
      const name = item.menuItem.name.padEnd(20).slice(0, 20);
      lines.push(`${item.quantity}x ${name} $${lineTotal.toFixed(2)}`);
      for (const mod of item.modifiers ?? []) {
        lines.push(`   + ${mod.name}`);
      }
    }

    lines.push(line);
    lines.push(`Subtotal:          $${subtotal.toFixed(2)}`);
    lines.push(`TOTAL PAID:        $${payment.amount.toFixed(2)}`);
    lines.push(`Method: ${payment.method}`);
    lines.push(line);
    lines.push('  Thank you for dining with us!');

    return lines.join('\n');
  }

  // ── HTML formatters (for browser print) ──────────────────────────────────

  private formatKitchenTicketHtml(order: any): string {
    const now = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const itemRows = order.items.map((item: any) => `
      <div class="item">
        <span class="qty">${item.quantity}x</span>
        <span class="name">${item.menuItem.name}</span>
      </div>
      ${(item.modifiers ?? []).map((m: any) => `<div class="mod">+ ${m.name}</div>`).join('')}
      ${item.notes ? `<div class="note">* ${item.notes}</div>` : ''}
    `).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: monospace; font-size: 14px; width: 300px; margin: 0 auto; padding: 10px; }
      h2 { text-align: center; font-size: 16px; margin: 4px 0; }
      .meta { font-size: 12px; margin: 4px 0; }
      hr { border: 1px dashed #000; }
      .item { display: flex; gap: 8px; margin: 4px 0; font-weight: bold; }
      .qty { min-width: 24px; }
      .mod { margin-left: 32px; font-size: 12px; }
      .note { margin-left: 32px; font-size: 12px; font-style: italic; }
      .order-note { background: #eee; padding: 4px; margin-top: 8px; font-size: 12px; }
    </style></head><body>
    <h2>*** KITCHEN TICKET ***</h2>
    <hr>
    <div class="meta"><strong>Order #${order.orderNumber}</strong> — Table ${order.table?.tableNumber ?? '?'}</div>
    <div class="meta">Time: ${now} | Staff: ${order.staff?.name ?? '?'}</div>
    <hr>
    ${itemRows}
    <hr>
    ${order.notes ? `<div class="order-note">NOTE: ${order.notes}</div>` : ''}
    </body></html>`;
  }

  private formatReceiptHtml(payment: any): string {
    const order = payment.order;
    const now = new Date(payment.createdAt).toLocaleString();
    let subtotal = 0;
    const itemRows = order.items.map((item: any) => {
      const modTotal = (item.modifiers ?? []).reduce((s: number, m: any) => s + m.priceAdjustment, 0);
      const lineTotal = (item.unitPrice + modTotal) * item.quantity;
      subtotal += lineTotal;
      return `
        <div class="item">
          <span>${item.quantity}x ${item.menuItem.name}</span>
          <span>$${lineTotal.toFixed(2)}</span>
        </div>
        ${(item.modifiers ?? []).map((m: any) => `<div class="mod">+ ${m.name}</div>`).join('')}
      `;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: monospace; font-size: 13px; width: 300px; margin: 0 auto; padding: 10px; }
      h2 { text-align: center; font-size: 15px; margin: 4px 0; }
      .sub { text-align: center; font-size: 12px; color: #555; }
      hr { border: 1px dashed #000; }
      .meta { font-size: 12px; margin: 3px 0; }
      .item { display: flex; justify-content: space-between; margin: 3px 0; }
      .mod { margin-left: 20px; font-size: 11px; color: #555; }
      .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 4px; }
      .thanks { text-align: center; margin-top: 8px; font-size: 12px; }
    </style></head><body>
    <h2>BISTRO RMS</h2>
    <div class="sub">Official Receipt</div>
    <hr>
    <div class="meta">Order #${order.orderNumber} — Table ${order.table?.tableNumber ?? '?'}</div>
    <div class="meta">Date: ${now}</div>
    <div class="meta">Staff: ${order.staff?.name ?? '?'}</div>
    <hr>
    ${itemRows}
    <hr>
    <div class="item"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="total"><span>TOTAL PAID</span><span>$${payment.amount.toFixed(2)}</span></div>
    <div class="meta">Method: ${payment.method}</div>
    <hr>
    <div class="thanks">Thank you for dining with us!</div>
    </body></html>`;
  }
}

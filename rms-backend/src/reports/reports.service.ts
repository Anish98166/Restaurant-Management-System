import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ── Revenue Report ────────────────────────────────────────────────────────

  async getRevenueReport(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const [payments, orders] = await Promise.all([
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.PAID, createdAt: { gte: start, lte: end } },
        include: { order: { select: { orderNumber: true, createdAt: true } } },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { status: true, totalAmount: true, createdAt: true },
      }),
    ]);

    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    const byMethod = {
      CASH: payments.filter((p) => p.method === PaymentMethod.CASH).reduce((s, p) => s + p.amount, 0),
      CARD: payments.filter((p) => p.method === PaymentMethod.CARD).reduce((s, p) => s + p.amount, 0),
      ONLINE: payments.filter((p) => p.method === PaymentMethod.ONLINE).reduce((s, p) => s + p.amount, 0),
    };

    // Daily breakdown
    const dailyMap: Record<string, number> = {};
    for (const p of payments) {
      const day = p.createdAt.toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] ?? 0) + p.amount;
    }
    const daily = Object.entries(dailyMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      startDate,
      endDate,
      totalRevenue,
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.status === OrderStatus.COMPLETED).length,
      cancelledOrders: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
      byMethod,
      daily,
    };
  }

  // ── Best/Worst Sellers ────────────────────────────────────────────────────

  async getItemPerformance(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const items = await this.prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: start, lte: end } } },
      include: { menuItem: { select: { name: true, category: true, price: true } } },
    });

    const map: Record<string, { name: string; category: string; quantity: number; revenue: number }> = {};
    for (const item of items) {
      if (!map[item.menuItemId]) {
        map[item.menuItemId] = {
          name: item.menuItem.name,
          category: item.menuItem.category,
          quantity: 0,
          revenue: 0,
        };
      }
      map[item.menuItemId].quantity += item.quantity;
      map[item.menuItemId].revenue += item.unitPrice * item.quantity;
    }

    const sorted = Object.entries(map)
      .map(([menuItemId, data]) => ({ menuItemId, ...data }))
      .sort((a, b) => b.quantity - a.quantity);

    return {
      startDate,
      endDate,
      best: sorted.slice(0, 10),
      worst: [...sorted].reverse().slice(0, 10),
    };
  }

  // ── Staff Performance ─────────────────────────────────────────────────────

  async getStaffPerformance(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: {
        staff: { select: { id: true, name: true, role: true } },
        payment: { select: { amount: true, status: true } },
      },
    });

    const staffMap: Record<string, {
      staffId: string; name: string; role: string;
      totalOrders: number; completedOrders: number; cancelledOrders: number; revenue: number;
    }> = {};

    for (const order of orders) {
      const sid = order.staffId;
      if (!staffMap[sid]) {
        staffMap[sid] = {
          staffId: sid,
          name: order.staff.name,
          role: order.staff.role,
          totalOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          revenue: 0,
        };
      }
      staffMap[sid].totalOrders++;
      if (order.status === OrderStatus.COMPLETED) staffMap[sid].completedOrders++;
      if (order.status === OrderStatus.CANCELLED) staffMap[sid].cancelledOrders++;
      if (order.payment?.status === PaymentStatus.PAID) {
        staffMap[sid].revenue += order.payment.amount;
      }
    }

    return {
      startDate,
      endDate,
      staff: Object.values(staffMap).sort((a, b) => b.totalOrders - a.totalOrders),
    };
  }

  // ── CSV Export ────────────────────────────────────────────────────────────

  async exportOrdersCsv(startDate: string, endDate: string): Promise<string> {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: {
        table: { select: { tableNumber: true } },
        staff: { select: { name: true } },
        payment: { select: { amount: true, method: true, status: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const header = 'Order#,Date,Time,Table,Staff,Status,Total,Payment Method,Payment Status\n';
    const rows = orders.map((o) => {
      const dt = new Date(o.createdAt);
      return [
        o.orderNumber,
        dt.toISOString().split('T')[0],
        dt.toTimeString().slice(0, 5),
        `Table ${o.table.tableNumber}`,
        o.staff.name,
        o.status,
        o.totalAmount.toFixed(2),
        o.payment?.method ?? '',
        o.payment?.status ?? 'UNPAID',
      ].join(',');
    });

    return header + rows.join('\n');
  }

  async exportPaymentsCsv(startDate: string, endDate: string): Promise<string> {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const payments = await this.prisma.payment.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: {
        order: {
          include: {
            table: { select: { tableNumber: true } },
            staff: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const header = 'Payment ID,Date,Time,Order#,Table,Staff,Amount,Method,Status\n';
    const rows = payments.map((p) => {
      const dt = new Date(p.createdAt);
      return [
        p.id,
        dt.toISOString().split('T')[0],
        dt.toTimeString().slice(0, 5),
        p.order.orderNumber,
        `Table ${p.order.table.tableNumber}`,
        p.order.staff.name,
        p.amount.toFixed(2),
        p.method,
        p.status,
      ].join(',');
    });

    return header + rows.join('\n');
  }
}

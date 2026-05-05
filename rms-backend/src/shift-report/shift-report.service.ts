import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class ShiftReportService {
  constructor(private prisma: PrismaService) {}

  /** Build a live preview of today's report without saving */
  async getPreview(date?: string) {
    const targetDate = date ?? new Date().toISOString().split('T')[0];
    return this.buildReport(targetDate);
  }

  /** Get all archived daily reports */
  async getHistory() {
    const reports = await this.prisma.dailyReport.findMany({
      orderBy: { date: 'desc' },
    });
    return reports.map((r) => ({
      ...r,
      topItems: JSON.parse(r.topItemsJson),
      paymentBreakdown: JSON.parse(r.paymentBreakdownJson),
    }));
  }

  /** Get a single archived report */
  async getOne(id: string) {
    const report = await this.prisma.dailyReport.findUnique({ where: { id } });
    if (!report) return null;
    return {
      ...report,
      topItems: JSON.parse(report.topItemsJson),
      paymentBreakdown: JSON.parse(report.paymentBreakdownJson),
    };
  }

  /** Close the day — saves a snapshot, prevents duplicate closes */
  async closeDay(closedById: string, date?: string) {
    const targetDate = date ?? new Date().toISOString().split('T')[0];

    const existing = await this.prisma.dailyReport.findUnique({ where: { date: targetDate } });
    if (existing) {
      throw new ConflictException(`Day ${targetDate} has already been closed`);
    }

    const data = await this.buildReport(targetDate);

    const report = await this.prisma.dailyReport.create({
      data: {
        date: targetDate,
        totalOrders: data.totalOrders,
        completedOrders: data.completedOrders,
        cancelledOrders: data.cancelledOrders,
        totalRevenue: data.totalRevenue,
        cashRevenue: data.cashRevenue,
        cardRevenue: data.cardRevenue,
        onlineRevenue: data.onlineRevenue,
        topItemsJson: JSON.stringify(data.topItems),
        paymentBreakdownJson: JSON.stringify(data.paymentBreakdown),
        closedById,
      },
    });

    return {
      ...report,
      topItems: data.topItems,
      paymentBreakdown: data.paymentBreakdown,
    };
  }

  private async buildReport(date: string) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const [orders, payments, orderItems] = await Promise.all([
      this.prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, status: true, totalAmount: true },
      }),
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.PAID, createdAt: { gte: start, lte: end } },
        select: { amount: true, method: true },
      }),
      this.prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: start, lte: end } } },
        include: { menuItem: { select: { name: true } } },
      }),
    ]);

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === OrderStatus.COMPLETED).length;
    const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;
    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    const cashRevenue = payments.filter((p) => p.method === PaymentMethod.CASH).reduce((s, p) => s + p.amount, 0);
    const cardRevenue = payments.filter((p) => p.method === PaymentMethod.CARD).reduce((s, p) => s + p.amount, 0);
    const onlineRevenue = payments.filter((p) => p.method === PaymentMethod.ONLINE).reduce((s, p) => s + p.amount, 0);

    // Top items by quantity sold
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const oi of orderItems) {
      if (!itemMap[oi.menuItemId]) {
        itemMap[oi.menuItemId] = { name: oi.menuItem.name, quantity: 0, revenue: 0 };
      }
      itemMap[oi.menuItemId].quantity += oi.quantity;
      itemMap[oi.menuItemId].revenue += oi.unitPrice * oi.quantity;
    }
    const topItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const paymentBreakdown = [
      { method: 'CASH', amount: cashRevenue, count: payments.filter((p) => p.method === PaymentMethod.CASH).length },
      { method: 'CARD', amount: cardRevenue, count: payments.filter((p) => p.method === PaymentMethod.CARD).length },
      { method: 'ONLINE', amount: onlineRevenue, count: payments.filter((p) => p.method === PaymentMethod.ONLINE).length },
    ];

    return {
      date,
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      cashRevenue,
      cardRevenue,
      onlineRevenue,
      topItems,
      paymentBreakdown,
    };
  }
}

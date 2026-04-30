import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrders,
      todayOrders,
      activeOrders,
      totalRevenue,
      todayRevenue,
      totalTables,
      occupiedTables,
      unpaidOrders,
      recentOrders,
      topMenuItems,
      ordersByStatus,
      weeklyRevenue,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.order.count({ where: { status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.SERVED] } } }),
      this.prisma.payment.aggregate({ where: { status: PaymentStatus.PAID }, _sum: { amount: true } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID, createdAt: { gte: today, lt: tomorrow } },
        _sum: { amount: true },
      }),
      this.prisma.restaurantTable.count(),
      this.prisma.restaurantTable.count({ where: { status: 'OCCUPIED' } }),
      this.prisma.order.count({
        where: { status: { in: [OrderStatus.SERVED, OrderStatus.COMPLETED] }, payment: null },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { table: true, items: { include: { menuItem: true } } },
      }),
      this.prisma.orderItem.groupBy({
        by: ['menuItemId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.getWeeklyRevenue(),
    ]);

    // Enrich top menu items
    const menuItemIds = topMenuItems.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } });
    const enrichedTopItems = topMenuItems.map((item) => ({
      ...item,
      menuItem: menuItems.find((m) => m.id === item.menuItemId),
    }));

    return {
      summary: {
        totalOrders,
        todayOrders,
        activeOrders,
        totalRevenue: totalRevenue._sum.amount ?? 0,
        todayRevenue: todayRevenue._sum.amount ?? 0,
        totalTables,
        occupiedTables,
        unpaidOrders,
      },
      recentOrders,
      topMenuItems: enrichedTopItems,
      ordersByStatus,
      weeklyRevenue,
    };
  }

  async getStaffSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      activeOrders,
      todayOrders,
      totalTables,
      occupiedTables,
      unpaidOrders,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.SERVED] } },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.restaurantTable.count(),
      this.prisma.restaurantTable.count({ where: { status: 'OCCUPIED' } }),
      this.prisma.order.count({
        where: { status: { in: [OrderStatus.SERVED, OrderStatus.COMPLETED] }, payment: null },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { table: true, items: { include: { menuItem: true } } },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    return {
      summary: {
        activeOrders,
        todayOrders,
        totalTables,
        occupiedTables,
        unpaidOrders,
      },
      recentOrders,
      ordersByStatus,
    };
  }

  private async getWeeklyRevenue() {
    const days: Array<{ date: string; revenue: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const revenue = await this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID, createdAt: { gte: date, lt: nextDate } },
        _sum: { amount: true },
      });

      days.push({
        date: date.toISOString().split('T')[0],
        revenue: revenue._sum.amount ?? 0,
      });
    }
    return days;
  }
}

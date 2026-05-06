import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const FREE_ITEM_THRESHOLD = 5; // free item after every 5 visits

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.loyaltyCustomer.findMany({
      orderBy: { visitCount: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.loyaltyCustomer.findUnique({
      where: { phone },
      include: { _count: { select: { orders: true } } },
    });
  }

  async findOne(id: string) {
    const c = await this.prisma.loyaltyCustomer.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: 'desc' }, take: 10, select: { orderNumber: true, totalAmount: true, createdAt: true } } },
    });
    if (!c) throw new NotFoundException('Loyalty customer not found');
    return c;
  }

  /** Called on every QR order — upserts the loyalty record and returns it */
  async recordVisit(phone: string, name?: string, email?: string, orderAmount = 0): Promise<{ id: string; freeItemReady: boolean }> {
    const existing = await this.prisma.loyaltyCustomer.findUnique({ where: { phone } });

    let customer;
    if (existing) {
      const newVisitCount = existing.visitCount + 1;
      const newTotalSpend = existing.totalSpend + orderAmount;
      // Award free item every FREE_ITEM_THRESHOLD visits
      const freeItemEarned = newVisitCount % FREE_ITEM_THRESHOLD === 0;

      customer = await this.prisma.loyaltyCustomer.update({
        where: { phone },
        data: {
          visitCount: newVisitCount,
          totalSpend: newTotalSpend,
          lastVisitAt: new Date(),
          name: name ?? existing.name,
          email: email ?? existing.email,
          freeItemEarned: freeItemEarned ? true : existing.freeItemEarned,
          freeItemUsed: freeItemEarned ? false : existing.freeItemUsed,
        },
      });
    } else {
      customer = await this.prisma.loyaltyCustomer.create({
        data: {
          phone,
          name,
          email,
          visitCount: 1,
          totalSpend: orderAmount,
          lastVisitAt: new Date(),
        },
      });
    }

    return {
      id: customer.id,
      freeItemReady: customer.freeItemEarned && !customer.freeItemUsed,
    };
  }

  async redeemFreeItem(id: string) {
    const c = await this.findOne(id);
    if (!c.freeItemEarned || c.freeItemUsed) {
      throw new NotFoundException('No free item available to redeem');
    }
    return this.prisma.loyaltyCustomer.update({
      where: { id },
      data: { freeItemUsed: true },
    });
  }

  async getSummary() {
    const [total, withFreeItem] = await Promise.all([
      this.prisma.loyaltyCustomer.count(),
      this.prisma.loyaltyCustomer.count({ where: { freeItemEarned: true, freeItemUsed: false } }),
    ]);
    const agg = await this.prisma.loyaltyCustomer.aggregate({ _sum: { totalSpend: true }, _avg: { visitCount: true } });
    return {
      totalCustomers: total,
      freeItemsPending: withFreeItem,
      totalLoyaltyRevenue: agg._sum.totalSpend ?? 0,
      avgVisits: Math.round((agg._avg.visitCount ?? 0) * 10) / 10,
      freeItemThreshold: FREE_ITEM_THRESHOLD,
    };
  }
}

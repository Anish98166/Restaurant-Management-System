import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  private include = {
    order: {
      select: {
        orderNumber: true,
        createdAt: true,
        table: { select: { tableNumber: true } },
        items: { include: { menuItem: { select: { id: true, name: true } } } },
      },
    },
  };

  async findAll() {
    return this.prisma.feedback.findMany({
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMenuItemRatings() {
    const feedbacks = await this.prisma.feedback.findMany({
      include: {
        order: { include: { items: { include: { menuItem: { select: { id: true, name: true } } } } } },
      },
    });

    const map: Record<string, { name: string; totalRating: number; count: number }> = {};
    for (const fb of feedbacks) {
      for (const item of fb.order.items) {
        const id = item.menuItem.id;
        if (!map[id]) map[id] = { name: item.menuItem.name, totalRating: 0, count: 0 };
        map[id].totalRating += fb.rating;
        map[id].count++;
      }
    }

    return Object.entries(map)
      .map(([menuItemId, d]) => ({
        menuItemId,
        name: d.name,
        avgRating: Math.round((d.totalRating / d.count) * 10) / 10,
        count: d.count,
      }))
      .sort((a, b) => b.avgRating - a.avgRating);
  }

  async getSummary() {
    const all = await this.prisma.feedback.findMany();
    if (!all.length) return { totalReviews: 0, avgRating: 0, distribution: {} };

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    for (const f of all) {
      distribution[f.rating] = (distribution[f.rating] ?? 0) + 1;
      total += f.rating;
    }

    return {
      totalReviews: all.length,
      avgRating: Math.round((total / all.length) * 10) / 10,
      distribution,
    };
  }

  async create(dto: CreateFeedbackDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const existing = await this.prisma.feedback.findUnique({ where: { orderId: dto.orderId } });
    if (existing) throw new ConflictException('Feedback already submitted for this order');

    return this.prisma.feedback.create({
      data: dto,
      include: this.include,
    });
  }

  async remove(id: string) {
    return this.prisma.feedback.delete({ where: { id } });
  }
}

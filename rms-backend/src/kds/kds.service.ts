import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, TableStatus } from '@prisma/client';

const BUMP_MAP: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PENDING]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.SERVED,
  [OrderStatus.SERVED]: OrderStatus.COMPLETED,
};

@Injectable()
export class KdsService {
  constructor(private prisma: PrismaService) {}

  private kdsInclude = {
    table: { select: { tableNumber: true } },
    items: {
      include: {
        menuItem: { select: { name: true, category: true } },
        modifiers: true,
      },
    },
  };

  async getActiveOrders() {
    return this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.SERVED] },
      },
      orderBy: { createdAt: 'asc' },
      include: this.kdsInclude,
    });
  }

  async bumpOrder(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new BadRequestException('Order not found');

    const nextStatus = BUMP_MAP[order.status];
    if (!nextStatus) throw new BadRequestException(`Cannot bump order in status ${order.status}`);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: nextStatus },
      include: this.kdsInclude,
    });

    // Free table when completed
    if (nextStatus === OrderStatus.COMPLETED) {
      const activeOrders = await this.prisma.order.count({
        where: {
          tableId: order.tableId,
          status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.SERVED] },
        },
      });
      if (activeOrders === 0) {
        await this.prisma.restaurantTable.update({
          where: { id: order.tableId },
          data: { status: TableStatus.CLEANING },
        });
      }
    }

    return updated;
  }
}

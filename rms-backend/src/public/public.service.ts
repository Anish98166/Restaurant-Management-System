import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublicCreateOrderDto } from './dto/public-order.dto';
import { TableStatus, MenuCategory } from '@prisma/client';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getMenu(category?: string) {
    const where: any = { available: true };
    if (category) where.category = category as MenuCategory;

    const items = await this.prisma.menuItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return items;
  }

  async getTable(tableId: string) {
    const table = await this.prisma.restaurantTable.findUnique({
      where: { id: tableId },
      select: { id: true, tableNumber: true, capacity: true, status: true },
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  async createOrder(dto: PublicCreateOrderDto) {
    const table = await this.prisma.restaurantTable.findUnique({
      where: { id: dto.tableId },
    });
    if (!table) throw new NotFoundException('Table not found');

    // Validate menu items
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: dto.items.map((i) => i.menuItemId) } },
    });

    if (menuItems.length !== dto.items.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    const unavailable = menuItems.filter((m) => !m.available);
    if (unavailable.length > 0) {
      throw new BadRequestException(
        `Items not available: ${unavailable.map((m) => m.name).join(', ')}`,
      );
    }

    const totalAmount = dto.items.reduce((sum, item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      return sum + menuItem.price * item.quantity;
    }, 0);

    // Find a system/guest staff user to assign the order to
    // Use the first STAFF user as the order owner for QR orders
    const staffUser = await this.prisma.user.findFirst({
      where: { role: 'STAFF' },
      orderBy: { createdAt: 'asc' },
    });

    if (!staffUser) {
      throw new BadRequestException('No staff available to process order');
    }

    const notes = [
      dto.customerName ? `Customer: ${dto.customerName}` : null,
      dto.notes || null,
      '(QR Order)',
    ]
      .filter(Boolean)
      .join(' | ');

    const order = await this.prisma.order.create({
      data: {
        tableId: dto.tableId,
        staffId: staffUser.id,
        notes,
        totalAmount,
        items: {
          create: dto.items.map((item) => {
            const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: menuItem.price,
              notes: item.notes,
            };
          }),
        },
      },
      include: {
        table: true,
        items: { include: { menuItem: true } },
      },
    });

    // Mark table as occupied
    await this.prisma.restaurantTable.update({
      where: { id: dto.tableId },
      data: { status: TableStatus.OCCUPIED },
    });

    return order;
  }
}

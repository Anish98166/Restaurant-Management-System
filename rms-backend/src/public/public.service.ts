import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublicCreateOrderDto } from './dto/public-order.dto';
import { TableStatus, MenuCategory } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private loyaltyService: LoyaltyService,
  ) {}

  async getMenu(category?: string) {
    const where: any = { available: true };
    if (category) where.category = category as MenuCategory;
    return this.prisma.menuItem.findMany({
      where,
      include: { modifierGroups: { include: { modifiers: { where: { available: true } } } } },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
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
    const table = await this.prisma.restaurantTable.findUnique({ where: { id: dto.tableId } });
    if (!table) throw new NotFoundException('Table not found');

    const menuItems = await this.prisma.menuItem.findMany({ where: { id: { in: dto.items.map((i) => i.menuItemId) } } });
    if (menuItems.length !== dto.items.length) throw new BadRequestException('One or more menu items not found');
    const unavailable = menuItems.filter((m) => !m.available);
    if (unavailable.length > 0) throw new BadRequestException(`Items not available: ${unavailable.map((m) => m.name).join(', ')}`);

    const totalAmount = dto.items.reduce((sum, item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      return sum + menuItem.price * item.quantity;
    }, 0);

    const staffUser = await this.prisma.user.findFirst({ where: { role: 'STAFF' }, orderBy: { createdAt: 'asc' } });
    if (!staffUser) throw new BadRequestException('No staff available to process order');

    const notes = [dto.customerName ? `Customer: ${dto.customerName}` : null, dto.notes || null, '(QR Order)'].filter(Boolean).join(' | ');

    const order = await this.prisma.order.create({
      data: {
        tableId: dto.tableId,
        staffId: staffUser.id,
        notes,
        totalAmount,
        items: {
          create: dto.items.map((item) => {
            const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
            return { menuItemId: item.menuItemId, quantity: item.quantity, unitPrice: menuItem.price, notes: item.notes };
          }),
        },
      },
      include: { table: true, items: { include: { menuItem: true } } },
    });

    await this.prisma.restaurantTable.update({ where: { id: dto.tableId }, data: { status: TableStatus.OCCUPIED } });
    await this.inventoryService.deductStock(dto.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })));

    // Record loyalty visit if phone provided
    if (dto.phone) {
      try {
        const loyalty = await this.loyaltyService.recordVisit(
          dto.phone,
          dto.customerName,
          dto.email,
          totalAmount,
        );
        // Link loyalty customer to order
        await this.prisma.order.update({
          where: { id: order.id },
          data: { loyaltyCustomerId: loyalty.id },
        });
      } catch {
        // Loyalty errors should never block the order
      }
    }

    return order;
  }

  async getReceipt(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            table: { select: { tableNumber: true } },
            staff: { select: { name: true } },
            items: {
              include: {
                menuItem: { select: { name: true, category: true } },
                modifiers: true,
              },
            },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Receipt not found');
    return payment;
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { OrderStatus, TableStatus } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  private orderInclude = {
    table: true,
    staff: { select: { id: true, name: true, email: true, role: true } },
    items: { include: { menuItem: true } },
    payment: true,
  };

  async findAll(query: OrderQueryDto) {
    const { status, tableId, page = 1, limit = 20, startDate, endDate } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status as OrderStatus;
    if (tableId) where.tableId = tableId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: this.orderInclude,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderInclude,
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto, staffId: string) {
    // Validate table exists
    const table = await this.prisma.restaurantTable.findUnique({ where: { id: dto.tableId } });
    if (!table) throw new NotFoundException('Table not found');

    // Validate and price menu items
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: dto.items.map((i) => i.menuItemId) } },
    });

    if (menuItems.length !== dto.items.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    const unavailable = menuItems.filter((m) => !m.available);
    if (unavailable.length > 0) {
      throw new BadRequestException(`Items not available: ${unavailable.map((m) => m.name).join(', ')}`);
    }

    const totalAmount = dto.items.reduce((sum, item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      return sum + menuItem.price * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        tableId: dto.tableId,
        staffId,
        notes: dto.notes,
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
      include: this.orderInclude,
    });

    // Mark table as occupied
    await this.prisma.restaurantTable.update({
      where: { id: dto.tableId },
      data: { status: TableStatus.OCCUPIED },
    });

    // Deduct inventory stock for ordered items
    await this.inventoryService.deductStock(
      dto.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
    );

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: this.orderInclude,
    });

    // Free table when order is completed or cancelled
    if (dto.status === OrderStatus.COMPLETED || dto.status === OrderStatus.CANCELLED) {
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

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.order.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  RestockDto,
  AdjustStockDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  private inventoryInclude = {
    menuItem: {
      select: { id: true, name: true, category: true, price: true, available: true },
    },
  };

  async findAll() {
    return this.prisma.inventoryItem.findMany({
      include: this.inventoryInclude,
      orderBy: { menuItem: { name: 'asc' } },
    });
  }

  async findLowStock() {
    const items = await this.prisma.inventoryItem.findMany({
      include: this.inventoryInclude,
    });
    return items.filter((item) => item.quantity <= item.lowStockThreshold);
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: this.inventoryInclude,
    });
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
    return item;
  }

  async findByMenuItemId(menuItemId: string) {
    return this.prisma.inventoryItem.findUnique({
      where: { menuItemId },
      include: this.inventoryInclude,
    });
  }

  async create(dto: CreateInventoryItemDto) {
    // Check menu item exists
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: dto.menuItemId },
    });
    if (!menuItem) throw new NotFoundException('Menu item not found');

    // Check no duplicate
    const existing = await this.prisma.inventoryItem.findUnique({
      where: { menuItemId: dto.menuItemId },
    });
    if (existing) {
      throw new ConflictException('Inventory item already exists for this menu item');
    }

    const item = await this.prisma.inventoryItem.create({
      data: {
        menuItemId: dto.menuItemId,
        quantity: dto.quantity,
        unit: dto.unit ?? 'portion',
        lowStockThreshold: dto.lowStockThreshold ?? 10,
        lastRestockedAt: dto.quantity > 0 ? new Date() : null,
      },
      include: this.inventoryInclude,
    });

    // Sync availability based on stock
    await this.syncMenuItemAvailability(dto.menuItemId, dto.quantity);

    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    await this.findOne(id);
    return this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
      include: this.inventoryInclude,
    });
  }

  async restock(id: string, dto: RestockDto) {
    const item = await this.findOne(id);
    const newQuantity = item.quantity + dto.quantity;

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        quantity: newQuantity,
        lastRestockedAt: new Date(),
      },
      include: this.inventoryInclude,
    });

    // Re-enable menu item if it was out of stock
    await this.syncMenuItemAvailability(item.menuItemId, newQuantity);

    return updated;
  }

  async adjustStock(id: string, dto: AdjustStockDto) {
    const item = await this.findOne(id);

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: { quantity: dto.quantity },
      include: this.inventoryInclude,
    });

    await this.syncMenuItemAvailability(item.menuItemId, dto.quantity);

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  /**
   * Deduct stock when an order is placed.
   * Called by OrdersService and PublicService.
   * Returns true if all items had sufficient stock.
   */
  async deductStock(items: Array<{ menuItemId: string; quantity: number }>) {
    for (const { menuItemId, quantity } of items) {
      const inv = await this.prisma.inventoryItem.findUnique({
        where: { menuItemId },
      });

      // If no inventory record exists, skip (untracked item)
      if (!inv) continue;

      const newQty = Math.max(0, inv.quantity - quantity);

      await this.prisma.inventoryItem.update({
        where: { menuItemId },
        data: { quantity: newQty },
      });

      // Auto-disable menu item when stock hits 0
      await this.syncMenuItemAvailability(menuItemId, newQty);
    }
  }

  private async syncMenuItemAvailability(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      await this.prisma.menuItem.update({
        where: { id: menuItemId },
        data: { available: false },
      });
    } else {
      // Only re-enable if it was disabled due to stock (not manually disabled)
      // We re-enable whenever stock > 0 after a restock
      await this.prisma.menuItem.update({
        where: { id: menuItemId },
        data: { available: true },
      });
    }
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto, RestockDto, AdjustStockDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  private include = {
    menuItem: { select: { id: true, name: true, category: true, price: true, available: true } },
  };

  async findAll() {
    return this.prisma.inventoryItem.findMany({ include: this.include, orderBy: { menuItem: { name: 'asc' } } });
  }

  async findLowStock() {
    const items = await this.prisma.inventoryItem.findMany({ include: this.include });
    return items.filter((i) => i.quantity <= i.lowStockThreshold);
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id }, include: this.include });
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
    return item;
  }

  async create(dto: CreateInventoryItemDto) {
    const menuItem = await this.prisma.menuItem.findUnique({ where: { id: dto.menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');
    const existing = await this.prisma.inventoryItem.findUnique({ where: { menuItemId: dto.menuItemId } });
    if (existing) throw new ConflictException('Inventory already exists for this menu item');

    const item = await this.prisma.inventoryItem.create({
      data: { menuItemId: dto.menuItemId, quantity: dto.quantity, unit: dto.unit ?? 'portion', lowStockThreshold: dto.lowStockThreshold ?? 10, lastRestockedAt: dto.quantity > 0 ? new Date() : null },
      include: this.include,
    });
    await this.syncAvailability(dto.menuItemId, dto.quantity);
    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    await this.findOne(id);
    return this.prisma.inventoryItem.update({ where: { id }, data: dto, include: this.include });
  }

  async restock(id: string, dto: RestockDto) {
    const item = await this.findOne(id);
    const newQty = item.quantity + dto.quantity;
    const updated = await this.prisma.inventoryItem.update({ where: { id }, data: { quantity: newQty, lastRestockedAt: new Date() }, include: this.include });
    await this.syncAvailability(item.menuItemId, newQty);
    return updated;
  }

  async adjustStock(id: string, dto: AdjustStockDto) {
    const item = await this.findOne(id);
    const updated = await this.prisma.inventoryItem.update({ where: { id }, data: { quantity: dto.quantity }, include: this.include });
    await this.syncAvailability(item.menuItemId, dto.quantity);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  async deductStock(items: Array<{ menuItemId: string; quantity: number }>) {
    for (const { menuItemId, quantity } of items) {
      const inv = await this.prisma.inventoryItem.findUnique({ where: { menuItemId } });
      if (!inv) continue;
      const newQty = Math.max(0, inv.quantity - quantity);
      await this.prisma.inventoryItem.update({ where: { menuItemId }, data: { quantity: newQty } });
      await this.syncAvailability(menuItemId, newQty);
    }
  }

  private async syncAvailability(menuItemId: string, quantity: number) {
    await this.prisma.menuItem.update({ where: { id: menuItemId }, data: { available: quantity > 0 } });
  }
}

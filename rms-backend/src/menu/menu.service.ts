import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto } from './dto/menu-item.dto';
import { MenuCategory } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  private menuInclude = {
    inventoryItem: true,
    modifierGroups: { include: { modifiers: { orderBy: { name: 'asc' as const } } }, orderBy: { name: 'asc' as const } },
  };

  async findAll(query: MenuItemQueryDto) {
    const { category, available, search, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (category) where.category = category as MenuCategory;
    if (available !== undefined) where.available = available === true || (available as any) === 'true';
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: this.menuInclude,
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return {
      data: items,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: this.menuInclude,
    });
    if (!item) throw new NotFoundException(`Menu item ${id} not found`);
    return item;
  }

  async create(dto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({ data: dto, include: this.menuInclude });
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.findOne(id);
    return this.prisma.menuItem.update({ where: { id }, data: dto, include: this.menuInclude });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.menuItem.delete({ where: { id } });
  }

  async toggleAvailability(id: string) {
    const item = await this.findOne(id);
    return this.prisma.menuItem.update({
      where: { id },
      data: { available: !item.available },
      include: this.menuInclude,
    });
  }
}

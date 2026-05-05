import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
  CreateModifierDto,
  UpdateModifierDto,
} from './dto/modifier.dto';

@Injectable()
export class ModifiersService {
  constructor(private prisma: PrismaService) {}

  // ── Modifier Groups ──────────────────────────────────────────────────────

  async getGroupsForMenuItem(menuItemId: string) {
    return this.prisma.modifierGroup.findMany({
      where: { menuItemId },
      include: { modifiers: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async createGroup(menuItemId: string, dto: CreateModifierGroupDto) {
    const menuItem = await this.prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');

    return this.prisma.modifierGroup.create({
      data: {
        menuItemId,
        name: dto.name,
        required: dto.required ?? false,
        multiSelect: dto.multiSelect ?? false,
        modifiers: dto.modifiers
          ? { create: dto.modifiers.map((m) => ({ name: m.name, priceAdjustment: m.priceAdjustment ?? 0 })) }
          : undefined,
      },
      include: { modifiers: true },
    });
  }

  async updateGroup(groupId: string, dto: UpdateModifierGroupDto) {
    const group = await this.prisma.modifierGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Modifier group not found');

    return this.prisma.modifierGroup.update({
      where: { id: groupId },
      data: {
        name: dto.name,
        required: dto.required,
        multiSelect: dto.multiSelect,
      },
      include: { modifiers: true },
    });
  }

  async deleteGroup(groupId: string) {
    const group = await this.prisma.modifierGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Modifier group not found');
    return this.prisma.modifierGroup.delete({ where: { id: groupId } });
  }

  // ── Modifiers ────────────────────────────────────────────────────────────

  async addModifier(groupId: string, dto: CreateModifierDto) {
    const group = await this.prisma.modifierGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Modifier group not found');

    return this.prisma.modifier.create({
      data: {
        modifierGroupId: groupId,
        name: dto.name,
        priceAdjustment: dto.priceAdjustment ?? 0,
        available: dto.available ?? true,
      },
    });
  }

  async updateModifier(modifierId: string, dto: UpdateModifierDto) {
    const modifier = await this.prisma.modifier.findUnique({ where: { id: modifierId } });
    if (!modifier) throw new NotFoundException('Modifier not found');

    return this.prisma.modifier.update({
      where: { id: modifierId },
      data: dto,
    });
  }

  async deleteModifier(modifierId: string) {
    const modifier = await this.prisma.modifier.findUnique({ where: { id: modifierId } });
    if (!modifier) throw new NotFoundException('Modifier not found');
    return this.prisma.modifier.delete({ where: { id: modifierId } });
  }
}

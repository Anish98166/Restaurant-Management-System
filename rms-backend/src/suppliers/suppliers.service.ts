import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import {
  CreateSupplierDto, UpdateSupplierDto, LinkSupplierItemDto,
  CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto, ReceivePurchaseOrderDto,
} from './dto/supplier.dto';
import { PurchaseOrderStatus } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  private poInclude = {
    supplier: { select: { id: true, name: true } },
    items: {
      include: {
        inventoryItem: {
          include: { menuItem: { select: { name: true } } },
        },
      },
    },
  };

  // ── Suppliers ─────────────────────────────────────────────────────────────

  async findAllSuppliers() {
    return this.prisma.supplier.findMany({
      include: {
        _count: { select: { purchaseOrders: true, supplierItems: true } },
        supplierItems: {
          include: { inventoryItem: { include: { menuItem: { select: { name: true } } } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneSupplier(id: string) {
    const s = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        supplierItems: { include: { inventoryItem: { include: { menuItem: { select: { name: true } } } } } },
        purchaseOrders: { orderBy: { createdAt: 'desc' }, take: 10, include: this.poInclude },
      },
    });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async createSupplier(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto) {
    await this.findOneSupplier(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async deleteSupplier(id: string) {
    await this.findOneSupplier(id);
    return this.prisma.supplier.delete({ where: { id } });
  }

  async linkItem(supplierId: string, dto: LinkSupplierItemDto) {
    await this.findOneSupplier(supplierId);
    return this.prisma.supplierItem.upsert({
      where: { supplierId_inventoryItemId: { supplierId, inventoryItemId: dto.inventoryItemId } },
      create: { supplierId, inventoryItemId: dto.inventoryItemId, unitCost: dto.unitCost ?? 0 },
      update: { unitCost: dto.unitCost ?? 0 },
    });
  }

  async unlinkItem(supplierId: string, inventoryItemId: string) {
    return this.prisma.supplierItem.deleteMany({ where: { supplierId, inventoryItemId } });
  }

  // ── Purchase Orders ───────────────────────────────────────────────────────

  async findAllPOs() {
    return this.prisma.purchaseOrder.findMany({
      include: this.poInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePO(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id }, include: this.poInclude });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async createPO(dto: CreatePurchaseOrderDto, createdById: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const totalCost = dto.items.reduce((s, i) => s + (i.unitCost ?? 0) * i.quantity, 0);

    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        notes: dto.notes,
        totalCost,
        createdById,
        items: {
          create: dto.items.map((i) => ({
            inventoryItemId: i.inventoryItemId,
            quantity: i.quantity,
            unitCost: i.unitCost ?? 0,
          })),
        },
      },
      include: this.poInclude,
    });
  }

  async updatePOStatus(id: string, dto: UpdatePurchaseOrderStatusDto) {
    const po = await this.findOnePO(id);
    if (po.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Cannot change status of a received purchase order');
    }

    const data: any = { status: dto.status };
    if (dto.status === PurchaseOrderStatus.SENT) data.orderedAt = new Date();

    return this.prisma.purchaseOrder.update({ where: { id }, data, include: this.poInclude });
  }

  async receivePO(id: string, dto: ReceivePurchaseOrderDto) {
    const po = await this.findOnePO(id);
    if (po.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Purchase order already received');
    }
    if (po.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot receive a cancelled purchase order');
    }

    // Build received quantities map
    const receivedMap: Record<string, number> = {};
    if (dto.items) {
      for (const item of dto.items) {
        receivedMap[item.purchaseOrderItemId] = item.received;
      }
    }

    // Restock each item
    for (const poItem of po.items) {
      const receivedQty = receivedMap[poItem.id] ?? poItem.quantity;
      if (receivedQty > 0) {
        // Update received count on PO item
        await this.prisma.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: { received: receivedQty },
        });
        // Restock inventory
        await this.inventoryService.restock(poItem.inventoryItemId, { quantity: receivedQty });
      }
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.RECEIVED, receivedAt: new Date() },
      include: this.poInclude,
    });
  }

  async deletePO(id: string) {
    const po = await this.findOnePO(id);
    if (po.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Cannot delete a received purchase order');
    }
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }
}

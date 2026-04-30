"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    orderInclude = {
        table: true,
        staff: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { menuItem: true } },
        payment: true,
    };
    async findAll(query) {
        const { status, tableId, page = 1, limit = 20, startDate, endDate } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (status)
            where.status = status;
        if (tableId)
            where.tableId = tableId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
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
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: this.orderInclude,
        });
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        return order;
    }
    async create(dto, staffId) {
        const table = await this.prisma.restaurantTable.findUnique({ where: { id: dto.tableId } });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        const menuItems = await this.prisma.menuItem.findMany({
            where: { id: { in: dto.items.map((i) => i.menuItemId) } },
        });
        if (menuItems.length !== dto.items.length) {
            throw new common_1.BadRequestException('One or more menu items not found');
        }
        const unavailable = menuItems.filter((m) => !m.available);
        if (unavailable.length > 0) {
            throw new common_1.BadRequestException(`Items not available: ${unavailable.map((m) => m.name).join(', ')}`);
        }
        const totalAmount = dto.items.reduce((sum, item) => {
            const menuItem = menuItems.find((m) => m.id === item.menuItemId);
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
                        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
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
        await this.prisma.restaurantTable.update({
            where: { id: dto.tableId },
            data: { status: client_1.TableStatus.OCCUPIED },
        });
        return order;
    }
    async updateStatus(id, dto) {
        const order = await this.findOne(id);
        const updated = await this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
            include: this.orderInclude,
        });
        if (dto.status === client_1.OrderStatus.COMPLETED || dto.status === client_1.OrderStatus.CANCELLED) {
            const activeOrders = await this.prisma.order.count({
                where: {
                    tableId: order.tableId,
                    status: { in: [client_1.OrderStatus.PENDING, client_1.OrderStatus.PREPARING, client_1.OrderStatus.SERVED] },
                },
            });
            if (activeOrders === 0) {
                await this.prisma.restaurantTable.update({
                    where: { id: order.tableId },
                    data: { status: client_1.TableStatus.CLEANING },
                });
            }
        }
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.order.delete({ where: { id } });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map
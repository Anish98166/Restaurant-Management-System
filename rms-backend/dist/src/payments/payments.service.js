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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            include: { order: { include: { table: true, staff: { select: { id: true, name: true } } } } },
        });
    }
    async findOne(id) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: { order: { include: { table: true, items: { include: { menuItem: true } } } } },
        });
        if (!payment)
            throw new common_1.NotFoundException(`Payment ${id} not found`);
        return payment;
    }
    async create(dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { payment: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.payment)
            throw new common_1.ConflictException('Payment already exists for this order');
        const payment = await this.prisma.payment.create({
            data: {
                orderId: dto.orderId,
                method: dto.method,
                amount: dto.amount ?? order.totalAmount,
                status: client_1.PaymentStatus.PAID,
            },
            include: { order: true },
        });
        await this.prisma.order.update({
            where: { id: dto.orderId },
            data: { status: client_1.OrderStatus.COMPLETED },
        });
        return payment;
    }
    async updateStatus(id, dto) {
        await this.findOne(id);
        return this.prisma.payment.update({ where: { id }, data: { status: dto.status } });
    }
    async getUnpaidOrders() {
        return this.prisma.order.findMany({
            where: {
                status: { in: [client_1.OrderStatus.SERVED, client_1.OrderStatus.COMPLETED] },
                payment: null,
            },
            include: { table: true, items: { include: { menuItem: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
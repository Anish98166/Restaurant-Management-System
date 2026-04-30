import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/payment.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { order: { include: { table: true, staff: { select: { id: true, name: true } } } } },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: { include: { table: true, items: { include: { menuItem: true } } } } },
    });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  async create(dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.payment) throw new ConflictException('Payment already exists for this order');

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        method: dto.method,
        amount: dto.amount ?? order.totalAmount,
        status: PaymentStatus.PAID,
      },
      include: { order: true },
    });

    // Mark order as completed
    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { status: OrderStatus.COMPLETED },
    });

    return payment;
  }

  async updateStatus(id: string, dto: UpdatePaymentStatusDto) {
    await this.findOne(id);
    return this.prisma.payment.update({ where: { id }, data: { status: dto.status } });
  }

  async getUnpaidOrders() {
    return this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.SERVED, OrderStatus.COMPLETED] },
        payment: null,
      },
      include: { table: true, items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}

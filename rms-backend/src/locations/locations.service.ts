import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class CreateLocationDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsString() @IsOptional() address?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() timezone?: string;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional() @IsBoolean() @IsOptional() active?: boolean;
}

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.location.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const loc = await this.prisma.location.findUnique({ where: { id } });
    if (!loc) throw new NotFoundException('Location not found');
    return loc;
  }

  async create(dto: CreateLocationDto) {
    return this.prisma.location.create({ data: { ...dto, timezone: dto.timezone ?? 'UTC' } });
  }

  async update(id: string, dto: UpdateLocationDto) {
    await this.findOne(id);
    return this.prisma.location.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.location.delete({ where: { id } });
  }

  async getCrossLocationAnalytics() {
    const locations = await this.prisma.location.findMany({ where: { active: true } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const analytics = await Promise.all(
      locations.map(async (loc) => {
        const [totalOrders, todayOrders, activeOrders, revenue, todayRevenue, tables] =
          await Promise.all([
            this.prisma.order.count({ where: { locationId: loc.id } }),
            this.prisma.order.count({ where: { locationId: loc.id, createdAt: { gte: today, lt: tomorrow } } }),
            this.prisma.order.count({
              where: { locationId: loc.id, status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.SERVED] } },
            }),
            this.prisma.payment.aggregate({
              where: { status: PaymentStatus.PAID, order: { locationId: loc.id } },
              _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
              where: { status: PaymentStatus.PAID, order: { locationId: loc.id }, createdAt: { gte: today, lt: tomorrow } },
              _sum: { amount: true },
            }),
            this.prisma.restaurantTable.count({ where: { locationId: loc.id } }),
          ]);

        return {
          location: loc,
          totalOrders,
          todayOrders,
          activeOrders,
          totalRevenue: revenue._sum.amount ?? 0,
          todayRevenue: todayRevenue._sum.amount ?? 0,
          tables,
        };
      }),
    );

    // Also include unassigned (null locationId) as "Main"
    const [unassignedOrders, unassignedRevenue] = await Promise.all([
      this.prisma.order.count({ where: { locationId: null } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID, order: { locationId: null } },
        _sum: { amount: true },
      }),
    ]);

    return {
      locations: analytics,
      unassigned: {
        totalOrders: unassignedOrders,
        totalRevenue: unassignedRevenue._sum.amount ?? 0,
      },
      totals: {
        orders: analytics.reduce((s, l) => s + l.totalOrders, 0) + unassignedOrders,
        revenue: analytics.reduce((s, l) => s + l.totalRevenue, 0) + (unassignedRevenue._sum.amount ?? 0),
      },
    };
  }
}

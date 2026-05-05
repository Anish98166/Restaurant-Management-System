import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  UpdateReservationStatusDto,
  ReservationQueryDto,
} from './dto/reservation.dto';
import { ReservationStatus, TableStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private include = {
    table: { select: { id: true, tableNumber: true, capacity: true, status: true } },
  };

  async findAll(query: ReservationQueryDto) {
    const where: any = {};
    if (query.date) where.date = query.date;
    if (query.tableId) where.tableId = query.tableId;
    if (query.status) where.status = query.status;

    return this.prisma.reservation.findMany({
      where,
      include: this.include,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async findUpcoming() {
    const today = new Date().toISOString().split('T')[0];
    return this.prisma.reservation.findMany({
      where: {
        date: { gte: today },
        status: { in: [ReservationStatus.CONFIRMED] },
      },
      include: this.include,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.reservation.findUnique({ where: { id }, include: this.include });
    if (!r) throw new NotFoundException(`Reservation ${id} not found`);
    return r;
  }

  async create(dto: CreateReservationDto, createdById: string) {
    const table = await this.prisma.restaurantTable.findUnique({ where: { id: dto.tableId } });
    if (!table) throw new NotFoundException('Table not found');

    // Check for conflicting reservations (same table, date, overlapping time ±90 min)
    const existing = await this.prisma.reservation.findMany({
      where: {
        tableId: dto.tableId,
        date: dto.date,
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.SEATED] },
      },
    });

    const [newH, newM] = dto.time.split(':').map(Number);
    const newMinutes = newH * 60 + newM;

    for (const r of existing) {
      const [rH, rM] = r.time.split(':').map(Number);
      const rMinutes = rH * 60 + rM;
      if (Math.abs(newMinutes - rMinutes) < 90) {
        throw new BadRequestException(
          `Table ${table.tableNumber} already has a reservation at ${r.time} on ${dto.date}`,
        );
      }
    }

    return this.prisma.reservation.create({
      data: { ...dto, createdById },
      include: this.include,
    });
  }

  async update(id: string, dto: UpdateReservationDto) {
    await this.findOne(id);
    return this.prisma.reservation.update({ where: { id }, data: dto, include: this.include });
  }

  async updateStatus(id: string, dto: UpdateReservationStatusDto) {
    const reservation = await this.findOne(id);

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status },
      include: this.include,
    });

    // When seated → mark table OCCUPIED
    if (dto.status === ReservationStatus.SEATED) {
      await this.prisma.restaurantTable.update({
        where: { id: reservation.tableId },
        data: { status: TableStatus.OCCUPIED },
      });
    }

    // When completed/cancelled/no-show → mark table AVAILABLE if no active orders
    if (
      dto.status === ReservationStatus.COMPLETED ||
      dto.status === ReservationStatus.CANCELLED ||
      dto.status === ReservationStatus.NO_SHOW
    ) {
      const activeOrders = await this.prisma.order.count({
        where: {
          tableId: reservation.tableId,
          status: { in: ['PENDING', 'PREPARING', 'SERVED'] },
        },
      });
      if (activeOrders === 0) {
        await this.prisma.restaurantTable.update({
          where: { id: reservation.tableId },
          data: { status: TableStatus.AVAILABLE },
        });
      }
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.reservation.delete({ where: { id } });
  }

  /** Called by a cron-like endpoint — marks overdue CONFIRMED reservations as NO_SHOW */
  async processNoShows(noShowAfterMinutes = 30) {
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const confirmed = await this.prisma.reservation.findMany({
      where: { date: todayDate, status: ReservationStatus.CONFIRMED },
    });

    const noShows = confirmed.filter((r) => {
      const [h, m] = r.time.split(':').map(Number);
      const reservationMinutes = h * 60 + m;
      return currentMinutes - reservationMinutes > noShowAfterMinutes;
    });

    for (const r of noShows) {
      await this.updateStatus(r.id, { status: ReservationStatus.NO_SHOW });
    }

    return { processed: noShows.length };
  }
}

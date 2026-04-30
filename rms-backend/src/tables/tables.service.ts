import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto } from './dto/table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.restaurantTable.findMany({
      orderBy: { tableNumber: 'asc' },
      include: {
        orders: {
          where: { status: { in: ['PENDING', 'PREPARING', 'SERVED'] } },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.restaurantTable.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { items: { include: { menuItem: true } } },
        },
      },
    });
    if (!table) throw new NotFoundException(`Table ${id} not found`);
    return table;
  }

  async create(dto: CreateTableDto) {
    const existing = await this.prisma.restaurantTable.findUnique({
      where: { tableNumber: dto.tableNumber },
    });
    if (existing) throw new ConflictException(`Table number ${dto.tableNumber} already exists`);
    return this.prisma.restaurantTable.create({ data: dto });
  }

  async update(id: string, dto: UpdateTableDto) {
    await this.findOne(id);
    return this.prisma.restaurantTable.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, dto: UpdateTableStatusDto) {
    await this.findOne(id);
    return this.prisma.restaurantTable.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.restaurantTable.delete({ where: { id } });
  }
}

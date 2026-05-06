import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private userSelect = {
    id: true, name: true, email: true, role: true,
    active: true, phone: true, lastLoginAt: true,
    createdAt: true, updatedAt: true,
  };

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        ...this.userSelect,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...this.userSelect,
        _count: { select: { orders: true } },
      },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: this.userSelect,
    });

    await this.logActivity(user.id, 'ACCOUNT_CREATED', `Account created by admin`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.userSelect,
    });
    await this.logActivity(id, 'ACCOUNT_UPDATED', `Profile updated`);
    return user;
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    await this.findOne(id);
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { password: hashed } });
    await this.logActivity(id, 'PASSWORD_CHANGED', 'Password changed by admin');
    return { message: 'Password updated successfully' };
  }

  async deactivate(id: string) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { active: false },
      select: this.userSelect,
    });
    await this.logActivity(id, 'ACCOUNT_DEACTIVATED', 'Account deactivated by admin');
    return user;
  }

  async activate(id: string) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { active: true },
      select: this.userSelect,
    });
    await this.logActivity(id, 'ACCOUNT_ACTIVATED', 'Account reactivated by admin');
    return user;
  }

  async getActivityLogs(userId?: string) {
    return this.prisma.activityLog.findMany({
      where: userId ? { userId } : undefined,
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async logActivity(userId: string, action: string, details?: string) {
    return this.prisma.activityLog.create({ data: { userId, action, details } });
  }
}

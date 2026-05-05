import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue report for a date range (Admin only)' })
  @ApiQuery({ name: 'startDate', example: '2026-05-01' })
  @ApiQuery({ name: 'endDate', example: '2026-05-31' })
  getRevenue(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.reportsService.getRevenueReport(startDate ?? today, endDate ?? today);
  }

  @Get('items')
  @ApiOperation({ summary: 'Best/worst selling items for a date range (Admin only)' })
  getItemPerformance(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.reportsService.getItemPerformance(startDate ?? today, endDate ?? today);
  }

  @Get('staff')
  @ApiOperation({ summary: 'Staff performance for a date range (Admin only)' })
  getStaffPerformance(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.reportsService.getStaffPerformance(startDate ?? today, endDate ?? today);
  }

  @Get('export/orders')
  @ApiOperation({ summary: 'Export orders as CSV (Admin only)' })
  async exportOrders(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const today = new Date().toISOString().split('T')[0];
    const csv = await this.reportsService.exportOrdersCsv(startDate ?? today, endDate ?? today);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${startDate}-${endDate}.csv"`);
    res.send(csv);
  }

  @Get('export/payments')
  @ApiOperation({ summary: 'Export payments as CSV (Admin only)' })
  async exportPayments(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const today = new Date().toISOString().split('T')[0];
    const csv = await this.reportsService.exportPaymentsCsv(startDate ?? today, endDate ?? today);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payments-${startDate}-${endDate}.csv"`);
    res.send(csv);
  }
}

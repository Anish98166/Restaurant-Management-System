import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShiftReportService } from './shift-report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Shift Report')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('shift-report')
export class ShiftReportController {
  constructor(private shiftReportService: ShiftReportService) {}

  @Get('preview')
  @ApiOperation({ summary: 'Preview today\'s report without closing (Admin only)' })
  getPreview(@Query('date') date?: string) {
    return this.shiftReportService.getPreview(date);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get all archived daily reports (Admin only)' })
  getHistory() {
    return this.shiftReportService.getHistory();
  }

  @Get('history/:id')
  @ApiOperation({ summary: 'Get a single archived report (Admin only)' })
  getOne(@Param('id') id: string) {
    return this.shiftReportService.getOne(id);
  }

  @Post('close')
  @ApiOperation({ summary: 'Close the day and archive the report (Admin only)' })
  closeDay(@CurrentUser('id') userId: string, @Query('date') date?: string) {
    return this.shiftReportService.closeDay(userId, date);
  }
}

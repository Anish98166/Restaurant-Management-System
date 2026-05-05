import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  UpdateReservationStatusDto,
  ReservationQueryDto,
} from './dto/reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reservations (filterable by date/table/status)' })
  findAll(@Query() query: ReservationQueryDto) {
    return this.reservationsService.findAll(query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming confirmed reservations' })
  findUpcoming() {
    return this.reservationsService.findUpcoming();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reservation by ID' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a reservation' })
  create(@Body() dto: CreateReservationDto, @CurrentUser('id') userId: string) {
    return this.reservationsService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a reservation' })
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update reservation status (seat / cancel / no-show)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a reservation (Admin only)' })
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }

  @Post('process-no-shows')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mark overdue reservations as no-show (Admin only)' })
  processNoShows(@Query('minutes') minutes?: string) {
    return this.reservationsService.processNoShows(minutes ? Number(minutes) : 30);
  }
}

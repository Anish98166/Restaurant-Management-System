import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Get()
  @ApiOperation({ summary: 'List all loyalty customers (Admin only)' })
  findAll() {
    return this.loyaltyService.findAll();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Loyalty programme summary stats (Admin only)' })
  getSummary() {
    return this.loyaltyService.getSummary();
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Look up customer by phone (Admin only)' })
  findByPhone(@Query('phone') phone: string) {
    return this.loyaltyService.findByPhone(phone);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loyalty customer detail (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.loyaltyService.findOne(id);
  }

  @Patch(':id/redeem')
  @ApiOperation({ summary: 'Redeem free item for a customer (Admin only)' })
  redeem(@Param('id') id: string) {
    return this.loyaltyService.redeemFreeItem(id);
  }
}

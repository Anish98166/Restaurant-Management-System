import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KdsService } from './kds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateOrderStatusDto } from '../orders/dto/order.dto';

@ApiTags('KDS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kds')
export class KdsController {
  constructor(private kdsService: KdsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active kitchen orders (PENDING + PREPARING + SERVED)' })
  getActiveOrders() {
    return this.kdsService.getActiveOrders();
  }

  @Patch(':id/bump')
  @ApiOperation({ summary: 'Bump order to next status' })
  bumpOrder(@Param('id') id: string) {
    return this.kdsService.bumpOrder(id);
  }
}

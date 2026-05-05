import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { PublicCreateOrderDto } from './dto/public-order.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('menu')
  @ApiOperation({ summary: 'Get available menu items (no auth required)' })
  getMenu(@Query('category') category?: string) {
    return this.publicService.getMenu(category);
  }

  @Get('tables/:tableId')
  @ApiOperation({ summary: 'Get table info by ID (no auth required)' })
  getTable(@Param('tableId') tableId: string) {
    return this.publicService.getTable(tableId);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Place an order from QR scan (no auth required)' })
  createOrder(@Body() dto: PublicCreateOrderDto) {
    return this.publicService.createOrder(dto);
  }
}

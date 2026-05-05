import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { PublicCreateOrderDto } from './dto/public-order.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('menu')
  @ApiOperation({ summary: 'Get available menu items (no auth)' })
  getMenu(@Query('category') category?: string) {
    return this.publicService.getMenu(category);
  }

  @Get('tables/:tableId')
  @ApiOperation({ summary: 'Get table info (no auth)' })
  getTable(@Param('tableId') tableId: string) {
    return this.publicService.getTable(tableId);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Place order from QR scan (no auth)' })
  createOrder(@Body() dto: PublicCreateOrderDto) {
    return this.publicService.createOrder(dto);
  }
}

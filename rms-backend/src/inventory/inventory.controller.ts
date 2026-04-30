import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  RestockDto,
  AdjustStockDto,
} from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory items (Admin only)' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low-stock items (Admin only)' })
  findLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create inventory record for a menu item (Admin only)' })
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory settings (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, dto);
  }

  @Patch(':id/restock')
  @ApiOperation({ summary: 'Add stock to an inventory item (Admin only)' })
  restock(@Param('id') id: string, @Body() dto: RestockDto) {
    return this.inventoryService.restock(id, dto);
  }

  @Patch(':id/adjust')
  @ApiOperation({ summary: 'Set exact stock quantity (Admin only)' })
  adjust(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove inventory tracking for a menu item (Admin only)' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}

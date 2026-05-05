import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto, RestockDto, AdjustStockDto } from './dto/inventory.dto';
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

  @Get() getAll() { return this.inventoryService.findAll(); }
  @Get('low-stock') getLowStock() { return this.inventoryService.findLowStock(); }
  @Get(':id') getOne(@Param('id') id: string) { return this.inventoryService.findOne(id); }
  @Post() create(@Body() dto: CreateInventoryItemDto) { return this.inventoryService.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) { return this.inventoryService.update(id, dto); }
  @Patch(':id/restock') restock(@Param('id') id: string, @Body() dto: RestockDto) { return this.inventoryService.restock(id, dto); }
  @Patch(':id/adjust') adjust(@Param('id') id: string, @Body() dto: AdjustStockDto) { return this.inventoryService.adjustStock(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.inventoryService.remove(id); }
}

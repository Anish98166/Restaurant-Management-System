import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import {
  CreateSupplierDto, UpdateSupplierDto, LinkSupplierItemDto,
  CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto, ReceivePurchaseOrderDto,
} from './dto/supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  // Suppliers
  @Get() findAll() { return this.suppliersService.findAllSuppliers(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.suppliersService.findOneSupplier(id); }
  @Post() create(@Body() dto: CreateSupplierDto) { return this.suppliersService.createSupplier(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) { return this.suppliersService.updateSupplier(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.suppliersService.deleteSupplier(id); }

  @Post(':id/items') linkItem(@Param('id') id: string, @Body() dto: LinkSupplierItemDto) { return this.suppliersService.linkItem(id, dto); }
  @Delete(':id/items/:inventoryItemId') unlinkItem(@Param('id') id: string, @Param('inventoryItemId') invId: string) { return this.suppliersService.unlinkItem(id, invId); }

  // Purchase Orders
  @Get('purchase-orders/all') findAllPOs() { return this.suppliersService.findAllPOs(); }
  @Get('purchase-orders/:id') findOnePO(@Param('id') id: string) { return this.suppliersService.findOnePO(id); }
  @Post('purchase-orders') createPO(@Body() dto: CreatePurchaseOrderDto, @CurrentUser('id') userId: string) { return this.suppliersService.createPO(dto, userId); }
  @Patch('purchase-orders/:id/status') updatePOStatus(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderStatusDto) { return this.suppliersService.updatePOStatus(id, dto); }
  @Post('purchase-orders/:id/receive') receivePO(@Param('id') id: string, @Body() dto: ReceivePurchaseOrderDto) { return this.suppliersService.receivePO(id, dto); }
  @Delete('purchase-orders/:id') deletePO(@Param('id') id: string) { return this.suppliersService.deletePO(id); }
}

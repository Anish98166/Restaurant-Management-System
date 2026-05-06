import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, Min, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PurchaseOrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsString() @IsOptional() contactName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
  @ApiPropertyOptional() @IsEmail() @IsOptional() email?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() address?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @ApiPropertyOptional() @IsBoolean() @IsOptional() active?: boolean;
}

export class LinkSupplierItemDto {
  @ApiProperty() @IsString() inventoryItemId: string;
  @ApiPropertyOptional({ example: 5.5 }) @IsNumber() @Min(0) @IsOptional() unitCost?: number;
}

export class PurchaseOrderItemDto {
  @ApiProperty() @IsString() inventoryItemId: string;
  @ApiProperty({ example: 50 }) @IsNumber() @Min(1) quantity: number;
  @ApiPropertyOptional({ example: 5.5 }) @IsNumber() @Min(0) @IsOptional() unitCost?: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty() @IsString() supplierId: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderStatusDto {
  @ApiProperty({ enum: PurchaseOrderStatus }) @IsEnum(PurchaseOrderStatus) status: PurchaseOrderStatus;
}

export class ReceivePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'Override received quantities per item' })
  @IsArray() @ValidateNested({ each: true }) @Type(() => ReceivedItemDto) @IsOptional()
  items?: ReceivedItemDto[];
}

export class ReceivedItemDto {
  @ApiProperty() @IsString() purchaseOrderItemId: string;
  @ApiProperty() @IsNumber() @Min(0) received: number;
}

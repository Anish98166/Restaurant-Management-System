import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Menu item ID to link inventory to' })
  @IsString()
  menuItemId: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 'portion', default: 'portion' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 10, description: 'Alert threshold for low stock' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;
}

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ example: 'portion' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;
}

export class RestockDto {
  @ApiProperty({ example: 50, description: 'Quantity to add to current stock' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AdjustStockDto {
  @ApiProperty({ example: 45, description: 'Set stock to this exact quantity' })
  @IsNumber()
  @Min(0)
  quantity: number;
}

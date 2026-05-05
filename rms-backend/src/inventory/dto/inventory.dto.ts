import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  quantity: number;

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

export class UpdateInventoryItemDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;
}

export class RestockDto {
  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AdjustStockDto {
  @ApiProperty({ example: 45 })
  @IsNumber()
  @Min(0)
  quantity: number;
}

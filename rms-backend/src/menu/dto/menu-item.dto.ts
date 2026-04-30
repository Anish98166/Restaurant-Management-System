import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { MenuCategory } from '@prisma/client';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Grilled Salmon' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Fresh Atlantic salmon with herbs' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 24.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: MenuCategory })
  @IsEnum(MenuCategory)
  category: MenuCategory;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}

export class MenuItemQueryDto {
  @IsOptional()
  @IsEnum(MenuCategory)
  category?: MenuCategory;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

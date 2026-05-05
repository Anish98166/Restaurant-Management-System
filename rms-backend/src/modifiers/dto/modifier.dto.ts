import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateModifierDto {
  @ApiProperty({ example: 'Extra Shot' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 1.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceAdjustment?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

export class UpdateModifierDto extends PartialType(CreateModifierDto) {}

export class CreateModifierGroupDto {
  @ApiProperty({ example: 'Size' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  multiSelect?: boolean;

  @ApiPropertyOptional({ type: [CreateModifierDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModifierDto)
  @IsOptional()
  modifiers?: CreateModifierDto[];
}

export class UpdateModifierGroupDto extends PartialType(CreateModifierGroupDto) {}
